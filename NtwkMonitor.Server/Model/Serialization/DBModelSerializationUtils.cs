using System;
using System.Net;

namespace NtwkMonitor.Server.Model.Serialization {

public static class DBModelSerializationUtils {

    public static uint IPtoUInt32(IPAddress addr) {
        return System.BitConverter.ToUInt32(addr.GetAddressBytes(), 0);
    }

    public static IPAddress UInt32toIP(uint addr) {
        return new IPAddress(BitConverter.GetBytes(addr));
    }

    public static NodeType? NodeTypeFromValueOrNull(int value) {
        int valueRange = System.Enum.GetValues(typeof(NodeType)).Length;
        if(value >= 0 && value < valueRange) {
            return (NodeType)value;
        }
        return null;
    }

    public static SerializableNtwkNode IntoSerializable(this NtwkNode node) {
        return new SerializableNtwkNode() {
            ID = node.ID,
            Type = node.Type,
            Parent = (node.Parent == null)?(null):(new ParentData() {
                ID = node.Parent.ID,
                Name = node.Parent.Name
            }),
            Name = node.Name,
            IsBlackBox = node.IsBlackBox,
            ipStr = UInt32toIP(node.ip).ToString(),
            IsOpenSSH = node.IsOpenSSH,
            IsOpenTelnet = node.IsOpenTelnet, 
            IsOpenWeb = node.IsOpenWeb,
            IsOpenPing = node.IsOpenPing
        };
    }

    /// <exception cref="FormatException">On invalid ip string.</exception>
    public static void CopyFromSerializable(
        this NtwkNode node, SerializableNtwkNode from) {
        node.Type = from.Type;
        node.Name = from.Name;
        node.IsBlackBox = from.IsBlackBox;
        if(from.IsBlackBox) {
            node.ip = 0;
            node.IsOpenPing = 
                node.IsOpenSSH = 
                node.IsOpenTelnet = 
                node.IsOpenWeb = false;
        }
        else {
            node.ip = IPtoUInt32(IPAddress.Parse(from.ipStr));
            node.IsOpenPing = from.IsOpenPing;
            node.IsOpenSSH = from.IsOpenSSH;
            node.IsOpenTelnet = from.IsOpenTelnet;
            node.IsOpenWeb = from.IsOpenWeb;
        }
    }
}

}