# EVM 合约调用工具

一个基于Web的EVM智能合约调用工具，支持通过MetaMask连接钱包，调用合约函数，并保存ABI配置。

## 功能特性

- 连接MetaMask钱包
- 保存和管理ABI
- 动态显示合约函数
- 支持调用只读和写入函数
- 交易历史记录
- 响应式设计

## 技术栈

- HTML5 / CSS3
- JavaScript (ES6+)
- ethers.js 库

## 目录结构

```
├── index.html          # 主HTML文件
├── css/
│   └── styles.css      # 样式表
├── js/
│   ├── main.js         # 主JavaScript入口
│   └── modules/        # JavaScript模块
│       ├── wallet-connector.js    # 钱包连接模块
│       ├── abi-manager.js         # ABI管理模块
│       ├── contract-interactor.js # 合约交互模块
│       ├── history-manager.js     # 历史记录管理模块
│       └── ui-manager.js          # UI管理模块
└── libs/
    ├── ethers.min.js           # ethers.js库(压缩版)
    └── ethers.umd.min.js       # ethers.js UMD库(压缩版)
```

## 使用方法

1. 打开`index.html`文件
2. 点击"连接MetaMask"按钮连接你的钱包
3. 输入合约地址
4. 粘贴合约ABI或选择已保存的ABI
5. 从下拉菜单选择要调用的合约函数
6. 输入所需参数
7. 点击"调用"按钮执行函数
8. 查看返回结果和交易历史

## 开发

本项目使用模块化的JavaScript结构，各模块职责清晰。如需扩展功能，可以在对应模块中进行修改。

### 主要模块

- **MetaMaskConnector**: 负责与MetaMask钱包的连接和交互
- **AbiManager**: 管理ABI的保存和加载
- **ContractInteractor**: 处理与智能合约的交互
- **HistoryManager**: 管理交易历史记录
- **UIManager**: 管理用户界面的更新和交互

## 注意事项

- 确保安装了MetaMask浏览器扩展
- 使用前请确认连接的网络是正确的
- 调用写入函数需要支付Gas费用
