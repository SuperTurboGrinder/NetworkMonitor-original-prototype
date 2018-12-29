using NtwkMonitor.Server.Model;

namespace NtwkMonitor.Server.Model.Serialization {

public class ParentData {
    public int ID;
    public string Name;
}

public class SerializableNtwkNode {
    public int ID;
    public NodeType Type;
    public ParentData Parent;
    public string Name;
    public bool IsBlackBox;
    public string ipStr;
    public bool IsOpenSSH, IsOpenTelnet, IsOpenWeb, IsOpenPing;
}

}