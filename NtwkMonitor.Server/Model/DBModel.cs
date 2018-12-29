using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace NtwkMonitor.Server.Model {

public enum NodeType {
    ExternalNode,
    Server,
    NetworkLayerSwitch,
    ClientSwitch
}

public class NtwkNode {
    public int ID { get; set; }
    public NtwkNode Parent { get; set; }
    public ICollection<NtwkNode> Children { get; set; }
    [Required] public string Name { get; set; }
    [Required] public NodeType Type { get; set; }
    [Required] public bool IsBlackBox { get; set; }
    public uint ip { get; set; }
    public bool IsOpenTelnet { get; set; }
    public bool IsOpenSSH { get; set; }
    public bool IsOpenWeb { get; set; }
    public bool IsOpenPing { get; set; }
}

}