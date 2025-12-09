/**
 * UI管理模块
 * 负责处理用户界面的更新和交互
 */
export class UIManager {
    constructor() {
        // UI元素缓存
        this.elements = {
            connectionStatus: document.getElementById('connectionStatus'),
            connectionStatusText: document.getElementById('connectionStatusText'),
            contractAddress: document.getElementById('contractAddress'),
            abiInput: document.getElementById('abiInput'),
            savedAbis: document.getElementById('savedAbis'),
            contractFunctions: document.getElementById('contractFunctions'),
            functionParams: document.getElementById('functionParams'),
            functionOutput: document.getElementById('functionOutput'),
            transactionHistory: document.getElementById('transactionHistory')
        };
        
        // 初始化通知系统（如果需要可以扩展）
        this._initNotification();
    }
    
    /**
     * 初始化通知系统
     * @private
     */
    _initNotification() {
        // 检查是否已存在通知容器，如果没有则创建
        if (!document.getElementById('notification-container')) {
            const container = document.createElement('div');
            container.id = 'notification-container';
            container.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                z-index: 9999;
            `;
            document.body.appendChild(container);
        }
    }
    
    /**
     * 显示通知
     * @param {string} message - 通知消息
     * @param {string} type - 通知类型 (success, error, warning, info)
     * @param {number} duration - 显示时长（毫秒）
     */
    showNotification(message, type = 'info', duration = 3000) {
        const container = document.getElementById('notification-container');
        const notification = document.createElement('div');
        
        // 设置通知样式
        const backgroundColor = {
            success: '#4caf50',
            error: '#f44336',
            warning: '#ff9800',
            info: '#2196f3'
        };
        
        notification.style.cssText = `
            margin-bottom: 10px;
            padding: 15px;
            border-radius: 5px;
            color: white;
            background-color: ${backgroundColor[type] || backgroundColor.info};
            box-shadow: 0 2px 5px rgba(0,0,0,0.2);
            opacity: 0;
            transition: opacity 0.3s;
        `;
        
        notification.textContent = message;
        container.appendChild(notification);
        
        // 淡入效果
        setTimeout(() => {
            notification.style.opacity = '1';
        }, 10);
        
        // 淡出并移除
        setTimeout(() => {
            notification.style.opacity = '0';
            setTimeout(() => {
                container.removeChild(notification);
            }, 300);
        }, duration);
    }
    
    /**
     * 显示成功通知
     * @param {string} message - 通知消息
     */
    showSuccess(message) {
        this.showNotification(message, 'success');
    }
    
    /**
     * 显示错误通知
     * @param {string} title - 错误标题
     * @param {string} message - 错误详细信息
     */
    showError(title, message) {
        this.showNotification(`${title}: ${message}`, 'error', 5000);
    }
    
    /**
     * 更新连接状态UI
     * @param {boolean} isConnected - 是否已连接
     * @param {string} address - 钱包地址
     * @param {string} chainId - 链ID
     */
    updateConnectionStatus(isConnected, address = '', chainId = '') {
        if (isConnected) {
            this.elements.connectionStatus.classList.add('connected');
            this.elements.connectionStatusText.textContent = '已连接';
            
            // 显示地址（缩略形式）
            const shortAddress = address.substring(0, 6) + '...' + address.substring(address.length - 4);
            this.elements.connectionStatusText.innerHTML = `已连接 <small>${shortAddress}</small>`;
            
            // 更新连接按钮文本
            document.getElementById('connectWallet').textContent = '已连接';
            document.getElementById('connectWallet').disabled = true;
        } else {
            this.elements.connectionStatus.classList.remove('connected');
            this.elements.connectionStatusText.textContent = '未连接';
            
            // 更新连接按钮文本
            document.getElementById('connectWallet').textContent = '连接 MetaMask';
            document.getElementById('connectWallet').disabled = false;
        }
    }
    
    /**
     * 更新链信息UI
     * @param {string} chainId - 链ID
     */
    updateChainInfo(chainId) {
        // 可以根据chainId显示网络名称
        const networks = {
            '0x1': '以太坊主网',
            '0x3': 'Ropsten测试网',
            '0x4': 'Rinkeby测试网',
            '0x5': 'Goerli测试网',
            '0x2a': 'Kovan测试网',
            '0x38': '币安智能链',
            '0x89': 'Polygon'
        };
        
        const networkName = networks[chainId] || `链ID: ${chainId}`;
        console.log(`当前网络: ${networkName}`);
        
        // 这里可以更新网络信息的UI元素（如果有）
    }
    
    /**
     * 填充ABI下拉列表
     * @param {Array} abiList - ABI名称列表
     */
    populateAbiDropdown(abiList) {
        const select = this.elements.savedAbis;
        
        // 清空现有选项（保留默认选项）
        while (select.options.length > 1) {
            select.remove(1);
        }
        
        // 添加新选项
        abiList.forEach(abiName => {
            const option = document.createElement('option');
            option.value = abiName;
            option.textContent = abiName;
            select.appendChild(option);
        });
    }
    
    /**
     * 填充合约函数下拉列表
     * @param {Array} functions - 函数列表
     */
    populateFunctionDropdown(functions) {
        const select = this.elements.contractFunctions;
        
        // 清空现有选项（保留默认选项）
        while (select.options.length > 1) {
            select.remove(1);
        }
        
        // 添加新选项，按函数类型分组
        const groups = {
            'view': '只读函数',
            'pure': '纯函数',
            'nonpayable': '写入函数',
            'payable': '支付函数'
        };
        
        // 创建选项组
        const optGroups = {};
        for (const key in groups) {
            optGroups[key] = document.createElement('optgroup');
            optGroups[key].label = groups[key];
        }
        
        // 将函数添加到相应的组
        functions.forEach(func => {
            const option = document.createElement('option');
            option.value = func.name;
            option.textContent = `${func.name}`;
            
            const group = func.type || 'nonpayable';
            optGroups[group].appendChild(option);
        });
        
        // 添加选项组到下拉列表
        for (const key in optGroups) {
            if (optGroups[key].children.length > 0) {
                select.appendChild(optGroups[key]);
            }
        }
    }
    
    /**
     * 渲染函数参数输入区域
     * @param {Object} functionDetails - 函数详细信息
     */
    renderFunctionParams(functionDetails) {
        const paramsContainer = this.elements.functionParams;
        paramsContainer.innerHTML = '';
        
        if (!functionDetails || !functionDetails.inputs || functionDetails.inputs.length === 0) {
            paramsContainer.innerHTML = '<p>此函数没有参数</p>';
            return;
        }
        
        // 创建参数输入表单
        const form = document.createElement('form');
        form.id = 'function-params-form';
        
        functionDetails.inputs.forEach((input, index) => {
            const row = document.createElement('div');
            row.className = 'param-row';
            
            const label = document.createElement('label');
            label.textContent = `${input.name || `参数${index + 1}`} (${input.type})`;
            
            let inputElement;
            
            // 根据类型选择合适的输入控件
            if (input.type === 'bool') {
                // 布尔类型使用选择框
                inputElement = document.createElement('select');
                const optTrue = document.createElement('option');
                optTrue.value = 'true';
                optTrue.textContent = 'True';
                
                const optFalse = document.createElement('option');
                optFalse.value = 'false';
                optFalse.textContent = 'False';
                
                inputElement.appendChild(optTrue);
                inputElement.appendChild(optFalse);
            } else {
                // 其他类型使用文本输入框
                inputElement = document.createElement('input');
                inputElement.type = 'text';
                
                if (input.type.includes('int')) {
                    inputElement.placeholder = '数字值';
                } else if (input.type === 'address') {
                    inputElement.placeholder = '0x...';
                } else if (input.type.includes('[]')) {
                    inputElement.placeholder = '数组值，用逗号分隔';
                }
            }
            
            inputElement.id = `param-${index}`;
            inputElement.dataset.type = input.type;
            inputElement.dataset.name = input.name || `param${index}`;
            
            row.appendChild(label);
            row.appendChild(inputElement);
            form.appendChild(row);
        });
        
        // 如果是payable函数，添加value输入框
        if (functionDetails.stateMutability === 'payable' || functionDetails.payable) {
            const valueRow = document.createElement('div');
            valueRow.className = 'param-row';
            
            const valueLabel = document.createElement('label');
            valueLabel.textContent = '发送ETH数量';
            
            const valueInput = document.createElement('input');
            valueInput.type = 'text';
            valueInput.id = 'eth-value';
            valueInput.placeholder = '0.01';
            
            valueRow.appendChild(valueLabel);
            valueRow.appendChild(valueInput);
            form.appendChild(valueRow);
        }
        
        paramsContainer.appendChild(form);
    }
    
    /**
     * 收集函数参数值
     * @returns {Array} 参数值数组
     */
    collectFunctionParams() {
        const form = document.getElementById('function-params-form');
        if (!form) return [];
        
        const params = [];
        const inputs = form.querySelectorAll('input, select');
        
        inputs.forEach(input => {
            // 跳过eth-value输入框，它不是函数参数
            if (input.id === 'eth-value') return;
            
            const value = input.value.trim();
            const type = input.dataset.type;
            
            // 根据类型处理值
            if (type === 'bool') {
                params.push(value === 'true');
            } else if (type.includes('[]')) {
                // 处理数组类型
                const arrayValues = value.split(',').map(v => v.trim());
                params.push(arrayValues);
            } else if (type.includes('int')) {
                // 处理整数类型
                params.push(value);
            } else {
                // 其他类型
                params.push(value);
            }
        });
        
        return params;
    }
    
    /**
     * 获取发送的ETH数量（如果有）
     * @returns {string|null} ETH数量
     */
    getEthValue() {
        const valueInput = document.getElementById('eth-value');
        return valueInput ? valueInput.value.trim() : null;
    }
    
    /**
     * 显示函数调用结果
     * @param {*} result - 函数调用结果
     */
    showFunctionResult(result) {
        const outputElement = this.elements.functionOutput;
        
        // 清空现有结果
        outputElement.innerHTML = '';
        
        if (result === undefined || result === null) {
            outputElement.textContent = '无返回值';
            return;
        }
        
        // 显示结果
        if (typeof result === 'object') {
            // 对象类型结果，格式化为JSON
            const formattedResult = JSON.stringify(result, null, 2);
            outputElement.innerHTML = `<pre>${formattedResult}</pre>`;
        } else {
            // 简单类型结果
            outputElement.textContent = result.toString();
        }
    }
    
    /**
     * 渲染交易历史记录
     * @param {Array} historyItems - 历史记录项目
     */
    renderTransactionHistory(historyItems) {
        const historyContainer = this.elements.transactionHistory;
        historyContainer.innerHTML = '';
        
        if (!historyItems || historyItems.length === 0) {
            historyContainer.innerHTML = '<p>暂无历史记录</p>';
            return;
        }
        
        // 显示最近的10条历史记录
        historyItems.slice(0, 10).forEach(item => {
            const historyItem = document.createElement('div');
            historyItem.className = 'history-item';
            
            // 创建时间和函数信息
            const date = new Date(item.timestamp);
            const timeStr = `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}:${date.getSeconds().toString().padStart(2, '0')}`;
            
            historyItem.innerHTML = `
                <div>
                    <div><strong>${item.function}</strong></div>
                    <div class="address-text">${this._shortenAddress(item.address)}</div>
                </div>
                <div class="history-time">${timeStr}</div>
            `;
            
            // 添加点击事件以显示详细信息
            historyItem.addEventListener('click', () => {
                // 显示历史记录详情
                this.showFunctionResult(item.result);
                
                // 高亮显示被点击的项目
                document.querySelectorAll('.history-item').forEach(el => {
                    el.classList.remove('selected');
                });
                historyItem.classList.add('selected');
            });
            
            historyContainer.appendChild(historyItem);
        });
    }
    
    /**
     * 缩短地址显示
     * @param {string} address - 完整地址
     * @returns {string} 缩短的地址
     * @private
     */
    _shortenAddress(address) {
        if (!address || address.length < 10) return address;
        return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
    }
}
