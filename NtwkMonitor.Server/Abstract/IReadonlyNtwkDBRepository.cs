using System.Collections.Generic;
using System.Net;

using NtwkMonitor.Server.Model.Serialization;

namespace NtwkMonitor.Server.Abstract {

public interface IReadOnlyNtwkDBRepository {
    
    IEnumerable<string> GetAllTypes();
    IEnumerable<SerializableNtwkNode> GetAllNodes();
    SerializableNtwkNode GetNode(int id);
    IPAddress GetNodeIPForPing(int id);
    string GetNodeIPForAppService(int id, AppServiceTypes serviceType);
    SerializableNtwkNode GetNodeParent(int nodeId);
    IEnumerable<SerializableNtwkNode> GetNodeChildren(int nodeId);
    IEnumerable<SerializableNtwkNode> GetRootChildren();
    IEnumerable<SerializableNtwkNode> GetNodesOfType(int typeVal);
}

}