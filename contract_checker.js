// 引入 Solidity 解析器
const SolidityParser = require('solidity-parser-antlr');

function checkContractCode(contractCode) {
    const results = [];
    let ast;

    try {
        // 解析合约代码
        ast = SolidityParser.parse(contractCode, { tolerant: false });
    } catch (error) {
        results.push("Failed to parse contract: " + error.message);
        return results;
    }

    // 检查敏感函数调用
    const sensitiveFunctions = ['call', 'delegatecall', 'send', 'transfer'];

    ast.children.forEach(node => {
        if (node.type === 'ContractDefinition') {
            node.subNodes.forEach(subNode => {
                if (subNode.type === 'FunctionDefinition') {
                    // 检查是否为 payable 函数
                    if (subNode.stateMutability === 'payable') {
                        results.push(`Warning: Function ${subNode.name} is payable, may have reentrancy attack risks.`);
                    }

                    // 检查公共函数是否缺乏访问控制
                    if (subNode.visibility === 'public') {
                        results.push(`Warning: Function ${subNode.name} is public, lacks proper access control.`);
                    }

                    // 检查函数体中的敏感函数调用
                    if (subNode.body && subNode.body.children) {
                        subNode.body.children.forEach(statement => {
                            if (statement.type === 'ExpressionStatement' && statement.expression.type === 'CallExpression') {
                                const callee = statement.expression.callee;
                                if (sensitiveFunctions.includes(callee.name)) {
                                    results.push(`Warning: Function ${subNode.name} contains a sensitive function call: ${callee.name}`);
                                }
                            }
                        });
                    }
                }
            });
        }
    });

    // 检查是否使用 tx.origin
    if (contractCode.includes('tx.origin')) {
        results.push("Warning: Contract uses tx.origin, which may lead to security risks.");
    }

    return results.length > 0 ? results : ["Contract passed inspection, no issues found."];
}

// Example contract code
const contractCode = `solidity code`;

// Run inspection
const results = checkContractCode(contractCode);
console.log(results.join('\n'));