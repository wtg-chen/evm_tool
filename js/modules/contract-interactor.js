/**
 * 合约交互模块
 * 负责与智能合约的交互
 */
export class ContractInteractor {
    constructor(options = {}) {
        this.contractAddress = null;
        this.abi = null;
        this.contract = null;
        this.contractWithSigner = null;
        
        // 获取provider和signer的函数
        this.getProvider = options.getProvider || (() => null);
        this.getSigner = options.getSigner || (() => null);
    }
    
    /**
     * 设置合约地址
     * @param {string} address - 合约地址
     */
    setContractAddress(address) {
        if (!ethers.utils.isAddress(address)) {
            throw new Error('无效的合约地址');
        }
        this.contractAddress = address;
        this._initializeContract();
        return true;
    }
    
    /**
     * 设置ABI
     * @param {Array|string} abi - 合约ABI（数组或JSON字符串）
     */
    setAbi(abi) {
        try {
            // 如果abi是字符串，则解析为JSON
            if (typeof abi === 'string') {
                this.abi = JSON.parse(abi);
            } else {
                this.abi = abi;
            }
            this._initializeContract();
            return true;
        } catch (error) {
            console.error('设置ABI失败:', error);
            throw new Error('无效的ABI格式');
        }
    }
    
    /**
     * 初始化合约实例
     * @private
     */
    _initializeContract() {
        if (!this.contractAddress || !this.abi) {
            return false;
        }
        
        try {
            const provider = this.getProvider();
            if (!provider) {
                console.warn('未提供Provider，合约初始化失败');
                return false;
            }
            
            // 创建只读合约实例
            this.contract = new ethers.Contract(
                this.contractAddress,
                this.abi,
                provider
            );
            
            // 创建可写入合约实例（需要签名者）
            const signer = this.getSigner();
            if (signer) {
                this.contractWithSigner = this.contract.connect(signer);
            }
            
            console.log('合约实例已初始化');
            return true;
        } catch (error) {
            console.error('初始化合约失败:', error);
            return false;
        }
    }
    
    /**
     * 获取合约是否已准备好
     */
    isContractReady() {
        return !!(this.contractAddress && this.abi && (this.contract || this.contractWithSigner));
    }
    
    /**
     * 获取合约地址
     */
    getContractAddress() {
        return this.contractAddress;
    }
    
    /**
     * 获取可用的合约函数列表
     * @returns {Array} 函数信息数组
     */
    getAvailableFunctions() {
        if (!this.abi) return [];
        
        return this.abi
            .filter(item => item.type === 'function')
            .map(func => ({
                name: func.name,
                type: func.stateMutability,
                inputs: func.inputs,
                outputs: func.outputs,
                constant: func.constant,
                payable: func.payable || func.stateMutability === 'payable'
            }));
    }
    
    /**
     * 获取函数详细信息
     * @param {string} functionName - 函数名称
     * @returns {Object|null} 函数详细信息
     */
    getFunctionDetails(functionName) {
        if (!this.abi) return null;
        
        const funcDef = this.abi.find(
            item => item.type === 'function' && item.name === functionName
        );
        
        return funcDef || null;
    }
    
    /**
     * 调用合约函数
     * @param {string} functionName - 函数名称
     * @param {Array} params - 函数参数
     * @param {Object} options - 调用选项（例如value）
     * @returns {Promise} 调用结果
     */
    async callFunction(functionName, params = [], options = {}) {
        if (!this.isContractReady()) {
            throw new Error('合约未准备好，请先设置合约地址和ABI');
        }
        
        const funcDetails = this.getFunctionDetails(functionName);
        if (!funcDetails) {
            throw new Error(`合约中不存在函数: ${functionName}`);
        }
        
        try {
            // 根据函数类型决定是读取还是写入操作
            const isReadOnly = 
                funcDetails.stateMutability === 'view' || 
                funcDetails.stateMutability === 'pure' ||
                funcDetails.constant;
                
            const isPayable = 
                funcDetails.stateMutability === 'payable' || 
                funcDetails.payable;
            
            // 处理参数类型转换
            const processedParams = this._processParams(funcDetails.inputs, params);
            
            if (isReadOnly) {
                // 只读函数调用
                const result = await this.contract[functionName](...processedParams);
                return this._formatResult(result, funcDetails.outputs);
            } else {
                // 需要交易的函数调用
                if (!this.contractWithSigner) {
                    throw new Error('需要签名者执行此操作，请先连接钱包');
                }
                
                const txOptions = {};
                
                // 如果是可支付函数且提供了value
                if (isPayable && options.value) {
                    txOptions.value = ethers.utils.parseEther(options.value.toString());
                }
                
                // 发送交易
                const tx = await this.contractWithSigner[functionName](
                    ...processedParams,
                    txOptions
                );
                
                // 等待交易确认
                const receipt = await tx.wait();
                return {
                    transactionHash: receipt.transactionHash,
                    blockNumber: receipt.blockNumber,
                    status: receipt.status === 1 ? '成功' : '失败',
                    events: receipt.events,
                    receipt: receipt
                };
            }
        } catch (error) {
            console.error(`调用合约函数失败 [${functionName}]:`, error);
            throw error;
        }
    }
    
    /**
     * 处理输入参数，进行必要的类型转换
     * @param {Array} inputDefinitions - 输入参数定义
     * @param {Array} params - 实际参数值
     * @returns {Array} 处理后的参数
     * @private
     */
    _processParams(inputDefinitions, params) {
        if (!inputDefinitions || !params) return [];
        
        return inputDefinitions.map((input, index) => {
            const value = params[index];
            if (value === undefined) return undefined;
            
            // 根据类型进行转换
            const type = input.type;
            
            // 处理数组类型
            if (type.includes('[]') && Array.isArray(value)) {
                return value;
            }
            
            // 处理常见类型
            if (type.startsWith('uint') || type.startsWith('int')) {
                return value.toString(); // ethers.js会自动处理数字类型
            } else if (type === 'address') {
                return value; // 地址应该已经是字符串
            } else if (type === 'bool') {
                return Boolean(value);
            } else if (type.startsWith('bytes')) {
                return value; // 字节类型
            } else if (type === 'string') {
                return value;
            }
            
            return value; // 其他类型按原样返回
        });
    }
    
    /**
     * 格式化合约调用结果
     * @param {*} result - 原始结果
     * @param {Array} outputDefinitions - 输出定义
     * @returns {*} 格式化后的结果
     * @private
     */
    _formatResult(result, outputDefinitions) {
        // 如果结果是BigNumber，转换为字符串
        if (ethers.BigNumber.isBigNumber(result)) {
            return result.toString();
        }
        
        // 如果结果是数组，并且输出定义也是数组
        if (Array.isArray(result) && outputDefinitions && outputDefinitions.length > 1) {
            // 创建一个对象，将每个输出与其名称关联
            const formattedResult = {};
            outputDefinitions.forEach((output, index) => {
                const value = result[index];
                const name = output.name || `output_${index}`;
                
                if (ethers.BigNumber.isBigNumber(value)) {
                    formattedResult[name] = value.toString();
                } else {
                    formattedResult[name] = value;
                }
            });
            return formattedResult;
        }
        
        return result;
    }
}
