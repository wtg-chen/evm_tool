/**
 * 历史记录管理模块
 * 负责交易历史记录的存储和管理
 */
export class HistoryManager {
    constructor() {
        this.history = [];
        this.maxHistoryItems = 50;
        this.storageKey = 'tx_history';
        
        // 加载历史记录
        this._loadHistory();
    }
    
    /**
     * 从本地存储加载历史记录
     * @private
     */
    _loadHistory() {
        try {
            const storedHistory = localStorage.getItem(this.storageKey);
            if (storedHistory) {
                this.history = JSON.parse(storedHistory);
                console.log(`已加载${this.history.length}条历史记录`);
            }
        } catch (error) {
            console.error('加载历史记录失败:', error);
            this.history = [];
        }
    }
    
    /**
     * 将历史记录保存到本地存储
     * @private
     */
    _saveHistory() {
        try {
            localStorage.setItem(this.storageKey, JSON.stringify(this.history));
        } catch (error) {
            console.error('保存历史记录失败:', error);
        }
    }
    
    /**
     * 添加新的历史记录项
     * @param {Object} historyItem - 历史记录项
     */
    addToHistory(historyItem) {
        // 添加到历史记录开头
        this.history.unshift(historyItem);
        
        // 限制历史记录数量
        if (this.history.length > this.maxHistoryItems) {
            this.history = this.history.slice(0, this.maxHistoryItems);
        }
        
        // 保存到本地存储
        this._saveHistory();
        return true;
    }
    
    /**
     * 清除历史记录
     */
    clearHistory() {
        this.history = [];
        this._saveHistory();
        return true;
    }
    
    /**
     * 删除特定的历史记录项
     * @param {number} index - 要删除的项目索引
     */
    deleteHistoryItem(index) {
        if (index >= 0 && index < this.history.length) {
            this.history.splice(index, 1);
            this._saveHistory();
            return true;
        }
        return false;
    }
    
    /**
     * 获取完整的历史记录
     * @returns {Array} 历史记录数组
     */
    getHistory() {
        return this.history;
    }
    
    /**
     * 获取指定数量的最近历史记录
     * @param {number} count - 要获取的记录数量
     * @returns {Array} 历史记录数组
     */
    getRecentHistory(count = 10) {
        return this.history.slice(0, count);
    }
    
    /**
     * 按合约地址筛选历史记录
     * @param {string} address - 合约地址
     * @returns {Array} 筛选后的历史记录
     */
    getHistoryByAddress(address) {
        return this.history.filter(item => 
            item.address && item.address.toLowerCase() === address.toLowerCase()
        );
    }
    
    /**
     * 按函数名筛选历史记录
     * @param {string} functionName - 函数名称
     * @returns {Array} 筛选后的历史记录
     */
    getHistoryByFunction(functionName) {
        return this.history.filter(item => 
            item.function === functionName
        );
    }
}
