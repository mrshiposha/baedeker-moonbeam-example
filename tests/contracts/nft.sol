// SPDX-License-Identifier: GPL-3.0-only
pragma solidity >=0.8.3;

import "../node_modules/@openzeppelin/contracts/token/ERC721/ERC721.sol";

contract Nft is ERC721 {
    constructor() ERC721("TEST", "TST")  {
	}

    function mint(address to, uint256 tokenId) external {
        _mint(to, tokenId);
    }
}