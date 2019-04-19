class BlockchainNodesHelper {
  public static getNodesAmountWithData(nodesResponse, amount: number) {
    const result = {};

    let counter = 0;
    for (const oneNode in nodesResponse.indexedNodes) {
      if (!nodesResponse.indexedNodes.hasOwnProperty(oneNode)) {
        continue;
      }

      result[oneNode] = {
        scaled_importance_amount: nodesResponse.indexedNodes[oneNode].scaled_importance_amount,
        votes_amount: nodesResponse.indexedNodes[oneNode].votes_amount,
        votes_count: nodesResponse.indexedNodes[oneNode].votes_count,
      };

      counter += 1;

      if (counter === amount) {
        break;
      }
    }

    return result;
  }
}

export = BlockchainNodesHelper;
