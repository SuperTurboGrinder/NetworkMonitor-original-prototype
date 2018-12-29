using System.Collections.Generic;
using System.Net;

using NtwkMonitor.Server.Model.Serialization;

namespace NtwkMonitor.Server.Abstract {

public interface INtwkDBRepository : IReadOnlyNtwkDBRepository {
    SerializableNtwkNode CreateNode(SerializableNtwkNode node, int parentID = 0);
    void UpdateNode(SerializableNtwkNode node, int parentID = 0);
    SerializableNtwkNode RemoveNode(int id);
}

}