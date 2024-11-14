// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract SecondHandMarket {
    // 商品结构
    struct Item {
        uint id;
        string name;
        uint price;
        address owner;
        bool sold;
    }

    // 状态变量
    address public owner;
    Item[] public items; // 商品列表
    uint public itemCount;

    constructor() {
        owner = msg.sender;
    }

    // 上架商品
    function listItem(string memory name, uint price) public {
        itemCount++;
        items.push(Item(itemCount, name, price, msg.sender, false));
    }

    // 获取商品信息
    function getItem(uint id) public view returns (Item memory) {
        require(id > 0 && id <= itemCount, "Item does not exist");
        return items[id - 1];
    }

    // 购买商品
    function buyItem(uint id) public payable {
        require(id > 0 && id <= itemCount, "Item does not exist");
        Item storage item = items[id - 1];
        require(!item.sold, "Item already sold");
        require(msg.value >= item.price, "Insufficient payment");

        // 更新商品状态
        item.owner = msg.sender;
        item.sold = true;
    }
    // 新增函数以返回所有商品 ID
    function getAllItemIds() public view returns (uint[] memory) {
        uint[] memory ids = new uint[](itemCount);
        for (uint i = 0; i < itemCount; i++) {
            ids[i] = items[i].id;
        }
        return ids;
    }
}
