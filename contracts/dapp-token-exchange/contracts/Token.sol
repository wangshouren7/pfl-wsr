// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.28;

// Token 合约实现了一个简单的 ERC20 代币
contract Token {
    // 代币信息
    string public name = "DAPP Token"; // 代币名称
    string public symbol = "DAPP"; // 代币符号
    uint256 public decimals = 18; // 小数位数
    uint256 public totalSupply; // 代币总供应量
    mapping(address => uint256) public balanceOf; // 账户余额映射
    mapping(address => mapping(/* spender */ address => uint256))
        public allowance; // 授权额度映射

    // 事件定义
    event Transfer(address indexed from, address indexed to, uint256 value);
    event Approval(
        address indexed _owner,
        address indexed _spender,
        uint256 _value
    );

    // 构造函数，初始化代币总供应量并分配给合约创建者
    constructor() {
        totalSupply = 1000000 * (10 ** decimals);
        balanceOf[msg.sender] = totalSupply;
    }

    // 内部函数，执行代币转账
    function _transfer(
        address _from,
        address _to,
        uint256 _value
    ) internal returns (bool success) {
        require(_to != address(0x0), "invalid address"); // 确保接收地址有效
        balanceOf[_from] = balanceOf[_from] - _value;
        balanceOf[_to] = balanceOf[_to] + _value;
        emit Transfer(_from, _to, _value);
        return true;
    }

    // 代币转账
    function transfer(
        address _to,
        uint256 _value
    ) public returns (bool success) {
        require(balanceOf[msg.sender] >= _value); // 确保余额足够
        _transfer(msg.sender, _to, _value);
        return true;
    }

    // 授权代币
    function approve(
        address _spender,
        uint256 _value
    ) public returns (bool success) {
        require(_spender != address(0x0), "invalid address"); // 确保授权地址有效
        allowance[msg.sender][_spender] = _value;
        emit Approval(msg.sender, _spender, _value);
        return true;
    }

    // 从授权账户转账
    function transferFrom(
        address _from,
        address _to,
        uint256 _value
    ) public returns (bool success) {
        require(_value <= balanceOf[_from], "not enough balance"); // 确保授权账户余额足够
        require(_value <= allowance[_from][msg.sender], "not enough allowance"); // 确保授权额度足够
        allowance[_from][msg.sender] = allowance[_from][msg.sender] - _value;
        _transfer(_from, _to, _value);
        return true;
    }
}
