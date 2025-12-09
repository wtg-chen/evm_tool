/**
 * ABI管理模块
 * 负责ABI的保存、加载和管理
 */
export class AbiManager {
    constructor() {
        this.savedAbis = {};
        this.storageKey = 'saved_abis';
    }
    
    /**
     * 加载保存的ABI列表
     */
    async loadSavedAbis() {
        try {
            const savedData = localStorage.getItem(this.storageKey);
            if (savedData) {
                this.savedAbis = JSON.parse(savedData);
                console.log('已加载保存的ABI列表');
            } else {
                console.log('没有找到保存的ABI');
            }
            return this.savedAbis;
        } catch (error) {
            console.error('加载ABI列表失败:', error);
            return {};
        }
    }
    
    /**
     * 保存ABI
     * @param {string} name - ABI名称
     * @param {string} content - ABI内容JSON字符串
     */
    saveAbi(name, content) {
        try {
            // 验证ABI格式
            const parsedAbi = JSON.parse(content);
            
            // 保存到本地存储
            this.savedAbis[name] = content;
            localStorage.setItem(this.storageKey, JSON.stringify(this.savedAbis));
            console.log(`ABI已保存: ${name}`);
            return true;
        } catch (error) {
            console.error('保存ABI失败:', error);
            throw new Error('ABI格式无效，请检查JSON格式是否正确');
        }
    }
    
    /**
     * 删除保存的ABI
     * @param {string} name - ABI名称
     */
    deleteAbi(name) {
        if (this.savedAbis[name]) {
            delete this.savedAbis[name];
            localStorage.setItem(this.storageKey, JSON.stringify(this.savedAbis));
            console.log(`ABI已删除: ${name}`);
            return true;
        }
        return false;
    }
    
    /**
     * 根据名称获取ABI
     * @param {string} name - ABI名称
     */
    getAbiByName(name) {
        return this.savedAbis[name] || null;
    }
    
    /**
     * 获取保存的ABI列表
     * @returns {Array} ABI名称列表
     */
    getSavedAbisList() {
        return Object.keys(this.savedAbis);
    }
    
    /**
     * 验证ABI格式是否正确
     * @param {string} abiString - ABI字符串
     * @returns {boolean} 是否有效
     */
    validateAbi(abiString) {
        try {
            const parsedAbi = JSON.parse(abiString);
            return Array.isArray(parsedAbi);
        } catch (error) {
            return false;
        }
    }
}
