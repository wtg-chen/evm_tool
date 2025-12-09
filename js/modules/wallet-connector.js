/**
 * MetaMask钱包连接模块
 */
export class MetaMaskConnector {
    constructor(callbacks = {}) {
        this.provider = null;
        this.signer = null;
        this.isConnected = false;
        this.currentAddress = null;
        this.currentChainId = null;
        
        // 回调函数
        this.callbacks = {
            onConnected: callbacks.onConnected || (() => {}),
            onDisconnected: callbacks.onDisconnected || (() => {}),
            onChainChanged: callbacks.onChainChanged || (() => {}),
            onAccountsChanged: callbacks.onAccountsChanged || (() => {})
        };
        
        // 初始化事件监听
        this._initEventListeners();
    }
    
    /**
     * 初始化事件监听器
     * @private
     */
    _initEventListeners() {
        if (window.ethereum) {
            // 链变更事件
            window.ethereum.on('chainChanged', (chainId) => {
                this.currentChainId = chainId;
                this.callbacks.onChainChanged(chainId);
                console.log(`Chain changed to: ${chainId}`);
            });
            
            // 账户变更事件
            window.ethereum.on('accountsChanged', (accounts) => {
                if (accounts.length === 0) {
                    this.isConnected = false;
                    this.currentAddress = null;
                    this.callbacks.onDisconnected();
                    console.log('Disconnected from wallet');
                } else {
                    this.currentAddress = accounts[0];
                    this.callbacks.onAccountsChanged(accounts);
                    console.log(`Account changed to: ${accounts[0]}`);
                }
            });
            
            // 断开连接事件
            window.ethereum.on('disconnect', () => {
                this.isConnected = false;
                this.currentAddress = null;
                this.callbacks.onDisconnected();
                console.log('Disconnected from wallet');
            });
        }
    }
    
    /**
     * 检查是否已连接到钱包
     */
    async checkConnection() {
        if (!window.ethereum) {
            console.error('MetaMask未安装');
            return false;
        }
        
        try {
            // 检查是否已授权连接
            const accounts = await window.ethereum.request({ method: 'eth_accounts' });
            if (accounts.length > 0) {
                this.isConnected = true;
                this.currentAddress = accounts[0];
                this.currentChainId = await window.ethereum.request({ method: 'eth_chainId' });
                
                // 初始化provider和signer
                this.provider = new ethers.providers.Web3Provider(window.ethereum);
                this.signer = this.provider.getSigner();
                
                this.callbacks.onConnected(this.currentAddress, this.currentChainId);
                console.log(`已连接到钱包: ${this.currentAddress}, Chain: ${this.currentChainId}`);
                return true;
            }
            return false;
        } catch (error) {
            console.error('检查钱包连接失败:', error);
            return false;
        }
    }
    
    /**
     * 连接到MetaMask钱包
     */
    async connect() {
        if (!window.ethereum) {
            throw new Error('MetaMask未安装，请先安装MetaMask插件');
        }
        
        try {
            // 请求连接MetaMask
            const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
            
            if (accounts.length > 0) {
                this.isConnected = true;
                this.currentAddress = accounts[0];
                this.currentChainId = await window.ethereum.request({ method: 'eth_chainId' });
                
                // 初始化provider和signer
                this.provider = new ethers.providers.Web3Provider(window.ethereum);
                this.signer = this.provider.getSigner();
                
                this.callbacks.onConnected(this.currentAddress, this.currentChainId);
                console.log(`已连接到钱包: ${this.currentAddress}, Chain: ${this.currentChainId}`);
                return this.currentAddress;
            } else {
                throw new Error('没有授权账户');
            }
        } catch (error) {
            console.error('连接钱包失败:', error);
            throw error;
        }
    }
    
    /**
     * 断开与钱包的连接
     * 注意：由于MetaMask API限制，目前没有直接断开连接的方法
     * 这个方法只是在应用内部表示断开连接
     */
    disconnect() {
        this.isConnected = false;
        this.currentAddress = null;
        this.callbacks.onDisconnected();
        console.log('已从钱包断开连接');
    }
    
    /**
     * 获取当前连接状态
     */
    getConnectionStatus() {
        return {
            isConnected: this.isConnected,
            address: this.currentAddress,
            chainId: this.currentChainId
        };
    }
    
    /**
     * 获取Provider
     */
    getProvider() {
        return this.provider;
    }
    
    /**
     * 获取Signer
     */
    getSigner() {
        return this.signer;
    }
    
    /**
     * 获取当前账户地址
     */
    getCurrentAddress() {
        return this.currentAddress;
    }
    
    /**
     * 获取当前链ID
     */
    getCurrentChainId() {
        return this.currentChainId;
    }
    
    /**
     * 切换网络
     * @param {string} chainId - 链ID，十六进制字符串，例如 "0x1" 表示以太坊主网
     */
    async switchChain(chainId) {
        if (!window.ethereum) {
            throw new Error('MetaMask未安装');
        }
        
        try {
            await window.ethereum.request({
                method: 'wallet_switchEthereumChain',
                params: [{ chainId }],
            });
            return true;
        } catch (error) {
            // 如果链不存在，可能需要添加网络
            console.error('切换网络失败:', error);
            throw error;
        }
    }
}
