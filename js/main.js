// 主入口文件
import { MetaMaskConnector } from './modules/wallet-connector.js';
import { AbiManager } from './modules/abi-manager.js';
import { ContractInteractor } from './modules/contract-interactor.js';
import { HistoryManager } from './modules/history-manager.js';
import { UIManager } from './modules/ui-manager.js';

// 应用初始化
document.addEventListener('DOMContentLoaded', async () => {
    const uiManager = new UIManager();
    
    // 初始化钱包连接器
    const metaMask = new MetaMaskConnector({
        onConnected: (address, chainId) => {
            uiManager.updateConnectionStatus(true, address, chainId);
        },
        onDisconnected: () => {
            uiManager.updateConnectionStatus(false);
        },
        onChainChanged: (chainId) => {
            uiManager.updateChainInfo(chainId);
        },
        onAccountsChanged: (accounts) => {
            if (accounts.length > 0) {
                uiManager.updateConnectionStatus(true, accounts[0]);
            } else {
                uiManager.updateConnectionStatus(false);
            }
        }
    });

    // 初始化ABI管理器
    const abiManager = new AbiManager();
    await abiManager.loadSavedAbis();
    uiManager.populateAbiDropdown(abiManager.getSavedAbisList());

    // 初始化合约交互器
    const contractInteractor = new ContractInteractor({
        getProvider: () => metaMask.getProvider(),
        getSigner: () => metaMask.getSigner()
    });

    // 初始化历史记录管理器
    const historyManager = new HistoryManager();
    uiManager.renderTransactionHistory(historyManager.getHistory());

    // 设置事件监听
    // 连接钱包按钮
    document.getElementById('connectWallet').addEventListener('click', async () => {
        try {
            await metaMask.connect();
        } catch (error) {
            uiManager.showError('连接钱包失败', error.message);
        }
    });

    // 保存ABI按钮
    document.getElementById('saveAbiBtn').addEventListener('click', () => {
        const abiText = document.getElementById('abiInput').value.trim();
        if (!abiText) {
            uiManager.showError('保存失败', 'ABI内容不能为空');
            return;
        }

        try {
            const abiName = prompt('请输入ABI名称（如：UC_NFT）');
            if (abiName) {
                abiManager.saveAbi(abiName, abiText);
                uiManager.populateAbiDropdown(abiManager.getSavedAbisList());
                uiManager.showSuccess('ABI保存成功');
            }
        } catch (error) {
            uiManager.showError('保存失败', error.message);
        }
    });

    // 选择保存的ABI下拉框
    document.getElementById('savedAbis').addEventListener('change', (e) => {
        const selectedAbiName = e.target.value;
        if (selectedAbiName) {
            const abiContent = abiManager.getAbiByName(selectedAbiName);
            document.getElementById('abiInput').value = abiContent;
            
            // 更新合约函数下拉框
            try {
                const parsedAbi = JSON.parse(abiContent);
                contractInteractor.setAbi(parsedAbi);
                uiManager.populateFunctionDropdown(contractInteractor.getAvailableFunctions());
            } catch (error) {
                uiManager.showError('ABI解析失败', error.message);
            }
        }
    });

    // 监听ABI文本框输入变化
    document.getElementById('abiInput').addEventListener('change', (e) => {
        const abiText = e.target.value.trim();
        if (abiText) {
            try {
                const parsedAbi = JSON.parse(abiText);
                contractInteractor.setAbi(parsedAbi);
                uiManager.populateFunctionDropdown(contractInteractor.getAvailableFunctions());
            } catch (error) {
                uiManager.showError('ABI解析失败', error.message);
            }
        }
    });

    // 监听合约地址输入框
    document.getElementById('contractAddress').addEventListener('change', (e) => {
        const address = e.target.value.trim();
        if (address) {
            contractInteractor.setContractAddress(address);
        }
    });

    // 监听合约函数选择
    document.getElementById('contractFunctions').addEventListener('change', (e) => {
        const selectedFunction = e.target.value;
        if (selectedFunction) {
            const functionDetails = contractInteractor.getFunctionDetails(selectedFunction);
            uiManager.renderFunctionParams(functionDetails);
        } else {
            document.getElementById('functionParams').innerHTML = '';
        }
    });

    // 调用函数按钮
    document.getElementById('callFunction').addEventListener('click', async () => {
        const functionName = document.getElementById('contractFunctions').value;
        if (!functionName) {
            uiManager.showError('调用失败', '请选择合约函数');
            return;
        }

        if (!contractInteractor.isContractReady()) {
            uiManager.showError('调用失败', '合约地址或ABI未设置');
            return;
        }

        try {
            const params = uiManager.collectFunctionParams();
            const result = await contractInteractor.callFunction(functionName, params);
            
            // 更新结果显示
            uiManager.showFunctionResult(result);
            
            // 添加到历史记录
            historyManager.addToHistory({
                timestamp: Date.now(),
                address: contractInteractor.getContractAddress(),
                function: functionName,
                params: params,
                result: result
            });
            
            // 更新历史记录显示
            uiManager.renderTransactionHistory(historyManager.getHistory());
        } catch (error) {
            uiManager.showError('调用失败', error.message);
        }
    });

    // 复制地址按钮
    document.getElementById('copyAddressBtn').addEventListener('click', () => {
        const addressInput = document.getElementById('contractAddress');
        addressInput.select();
        document.execCommand('copy');
        uiManager.showSuccess('地址已复制');
    });

    // 窗口控制按钮已移除，应用现在占据整个屏幕

    // 检查是否已连接钱包
    await metaMask.checkConnection();
});
