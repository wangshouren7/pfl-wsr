// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.28;

import "./Token.sol";
import "hardhat/console.sol";

// Exchange 合约用于管理去中心化交易所的功能
contract Exchange {
    // 订单状态枚举
    enum OrderStatus {
        PENDING,
        FILLED,
        CANCELLED
    }

    // 变量定义
    address public feeAccount; // 收取交易费用的账户
    uint256 public feePercent; // 交易费用的百分比
    address constant ETHER = address(0); // 用于存储以太币的特殊地址
    mapping(address => mapping(address => uint256)) public tokens; // 代币余额映射
    mapping(uint256 => _Order) public orders; // 订单映射
    uint public orderCount; // 订单计数器

    // 事件定义
    event Deposit(address token, address user, uint256 amount, uint256 balance);
    event Withdraw(
        address token,
        address user,
        uint256 amount,
        uint256 balance
    );
    event Order(
        uint256 id,
        address user,
        address tokenGet,
        uint256 amountGet,
        address tokenGive,
        uint256 amountGive,
        uint256 timestamp
    );
    event Cancel(
        uint256 id,
        address user,
        address tokenGet,
        uint256 amountGet,
        address tokenGive,
        uint256 amountGive,
        uint256 timestamp
    );
    event Trade(
        uint256 id,
        address user,
        address tokenGet,
        uint256 amountGet,
        address tokenGive,
        uint256 amountGive,
        address userFill,
        uint256 timestamp
    );

    // 订单结构体
    struct _Order {
        uint256 id; // 订单唯一标识符
        address user; // 订单创建者
        address tokenGet; // 期望获取的代币地址
        uint256 amountGet; // 期望获取的代币数量
        address tokenGive; // 提供的代币地址
        uint256 amountGive; // 提供的代币数量
        uint256 timestamp; // 订单创建时间戳
        OrderStatus status; // 订单状态
    }

    // 构造函数，初始化费用账户和费用百分比
    constructor(address _feeAccount, uint256 _feePercent) {
        feeAccount = _feeAccount;
        feePercent = _feePercent;
    }

    // // 回退函数，防止意外发送以太币到合约
    // function() external {
    //     revert();
    // }

    // 存入以太币
    function depositEther() public payable {
        require(msg.value > 0, "Amount must be greater than 0");
        tokens[ETHER][msg.sender] = tokens[ETHER][msg.sender] + msg.value;
        emit Deposit(ETHER, msg.sender, msg.value, tokens[ETHER][msg.sender]);
    }

    // 提取以太币
    function withdrawEther(uint256 _amount) public {
        require(tokens[ETHER][msg.sender] >= _amount, "Insufficient balance"); // 确保余额足够
        tokens[ETHER][msg.sender] = tokens[ETHER][msg.sender] - _amount;
        payable(msg.sender).transfer(_amount);
        emit Withdraw(ETHER, msg.sender, _amount, tokens[ETHER][msg.sender]);
    }

    // 存入代币
    function depositToken(address _token, uint _amount) public {
        require(_token != ETHER, "Invalid token"); // 不允许存入以太币
        require(_amount > 0, "Amount must be greater than 0");
        require(
            Token(_token).transferFrom(msg.sender, address(this), _amount),
            "Transfer failed"
        ); // 代币转账到合约
        tokens[_token][msg.sender] = tokens[_token][msg.sender] + _amount;
        emit Deposit(_token, msg.sender, _amount, tokens[_token][msg.sender]);
    }

    // 提取代币
    function withdrawToken(address _token, uint256 _amount) public {
        require(_token != ETHER, "Invalid token");
        require(tokens[_token][msg.sender] >= _amount, "Insufficient balance");
        tokens[_token][msg.sender] = tokens[_token][msg.sender] - _amount;
        require(Token(_token).transfer(msg.sender, _amount), "Transfer failed");
        emit Withdraw(_token, msg.sender, _amount, tokens[_token][msg.sender]);
    }

    // 查询用户代币余额
    function balanceOf(
        address _token,
        address _user
    ) public view returns (uint256) {
        return tokens[_token][_user];
    }

    // 创建订单
    function makeOrder(
        address _tokenGet,
        uint256 _amountGet,
        address _tokenGive,
        uint256 _amountGive
    ) public {
        orderCount = orderCount + 1;
        orders[orderCount] = _Order(
            orderCount,
            msg.sender,
            _tokenGet,
            _amountGet,
            _tokenGive,
            _amountGive,
            block.timestamp,
            OrderStatus.PENDING // 初始状态为等待中
        );
        emit Order(
            orderCount,
            msg.sender,
            _tokenGet,
            _amountGet,
            _tokenGive,
            _amountGive,
            block.timestamp
        );
    }

    // 取消订单
    function cancelOrder(uint256 _id) public {
        _Order storage _order = orders[_id];
        require(_order.id == _id, "Order not found"); // 订单必须存在
        require(
            address(_order.user) == msg.sender,
            "Only allow order creator to cancel"
        ); // 必须是订单创建者
        require(
            _order.status == OrderStatus.PENDING,
            "Order cannot be cancelled"
        ); // 只能取消待处理的订单

        _order.status = OrderStatus.CANCELLED; // 更新状态为已取消

        emit Cancel(
            _order.id,
            msg.sender,
            _order.tokenGet,
            _order.amountGet,
            _order.tokenGive,
            _order.amountGive,
            _order.timestamp
        );
    }

    // 完成订单
    function fillOrder(uint256 _id) public {
        require(_id > 0 && _id <= orderCount, "Invalid order ID"); // 确保订单ID有效

        _Order storage _order = orders[_id];
        require(_order.status == OrderStatus.PENDING, "Order not available"); // 只能执行待处理的订单

        _trade(
            _order.id,
            _order.user,
            _order.tokenGet,
            _order.amountGet,
            _order.tokenGive,
            _order.amountGive
        );

        _order.status = OrderStatus.FILLED; // 更新状态为已完成
    }

    // 检查订单状态
    function getOrderStatus(uint256 _id) public view returns (OrderStatus) {
        require(_id > 0 && _id <= orderCount, "Invalid order ID");
        return orders[_id].status;
    }

    // 内部函数，执行交易
    // _trade 函数用于执行代币交易，并处理相关的余额更新和手续费计算
    function _trade(
        uint256 _id, // 订单ID，用于标识交易
        address _user, // 订单创建者的地址
        address _tokenGet, // 交易中获取的代币地址
        uint256 _amountGet, // 交易中获取的代币数量
        address _tokenGive, // 交易中支付的代币地址
        uint256 _amountGive // 交易中支付的代币数量
    ) internal {
        // Fee is paid by the user who filled the order (msg.sender)
        // Fee is deducted from _amountGet
        uint256 _feeAmount = (_amountGet * feePercent) / 100;

        // Execute the trade
        // msg.sender is the user who filled the order, while _user is who created the order
        require(
            tokens[_tokenGet][msg.sender] >= _amountGet + _feeAmount,
            "Insufficient balance"
        );
        tokens[_tokenGet][msg.sender] =
            tokens[_tokenGet][msg.sender] -
            (_amountGet + _feeAmount);

        tokens[_tokenGet][_user] = tokens[_tokenGet][_user] + _amountGet;

        // Charge fees
        tokens[_tokenGet][feeAccount] =
            tokens[_tokenGet][feeAccount] +
            _feeAmount;

        require(
            tokens[_tokenGive][_user] >= _amountGive,
            "Insufficient balance"
        );
        tokens[_tokenGive][_user] = tokens[_tokenGive][_user] - _amountGive;

        tokens[_tokenGive][msg.sender] =
            tokens[_tokenGive][msg.sender] +
            _amountGive;

        // 触发 Trade 事件，记录交易的详细信息
        emit Trade(
            _id, // 订单ID
            _user, // 订单创建者
            _tokenGet, // 获取的代币地址
            _amountGet, // 获取的代币数量
            _tokenGive, // 支付的代币地址
            _amountGive, // 支付的代币数量
            msg.sender, // 交易执行者
            block.timestamp // 交易时间戳
        );
    }

    function getOrders() public view returns (_Order[] memory) {
        _Order[] memory _orders = new _Order[](orderCount);
        for (uint256 i = 0; i < orderCount; i++) {
            _orders[i] = orders[i + 1]; // 修正索引，因为orders映射从1开始
        }

        return _orders;
    }
}
