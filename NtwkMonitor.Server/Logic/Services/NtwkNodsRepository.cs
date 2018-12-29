using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using Microsoft.EntityFrameworkCore;

using NtwkMonitor.Server.Model;
using NtwkMonitor.Server.Model.Serialization;
using NtwkMonitor.Server.Exceptions;
using NtwkMonitor.Server.Abstract;

namespace NtwkMonitor.Server.Logic.Services {

public class NtwkDBRepository : INtwkDBRepository {
    static readonly IEnumerable<string> typesCache =
        System.Enum.GetNames(typeof(NodeType));
    readonly NtwkDBContext db;
    
    public NtwkDBRepository(NtwkDBContext context) {
        db = context;
    }

    public IEnumerable<string> GetAllTypes() {
        return typesCache;
    }

    public IEnumerable<SerializableNtwkNode> GetAllNodes() {
        return db.Nodes.AsNoTracking()
            .Include(n => n.Parent)
            .Select(n => n.IntoSerializable());
    }

    private InvalidClientDataException EntrySpecifiedByIDDoesNotExis() {
        return new InvalidClientDataException(
                "Entry specified by ID does not exist.");
    }

    /// <exception cref="InvalidClientDataException">On invalid client input vales.</exception>
    private NtwkNode ModelNodeOrThrowWithParent(int id) {
        var node = db.Nodes.AsNoTracking()
            .Include(n => n.Parent)
            .SingleOrDefault(n => n.ID == id);
        if(node == null) {
            throw EntrySpecifiedByIDDoesNotExis();
        }
        return node;
    }

    /// <exception cref="InvalidClientDataException">On invalid client input vales.</exception>
    private IEnumerable<NtwkNode> ModelNodeChildrenOrThrow(int id) {
        var node = db.Nodes.AsNoTracking()
            .Include(n => n.Children)
                .ThenInclude(n => n.Parent)
            .SingleOrDefault(n => n.ID == id);
        if(node == null) {
            throw EntrySpecifiedByIDDoesNotExis();
        }
        return node.Children;
    }

    /// <exception cref="InvalidClientDataException">On invalid client input vales.</exception>
    public SerializableNtwkNode GetNode(int id) {
        var node = ModelNodeOrThrowWithParent(id);
        return node.IntoSerializable();
    }

    private IPAddress IPForService(
        int nodeID,
        Func<NtwkNode, bool> nodeServiceOpenProperty,
        string serviceName
    ) {
        var node = db.Nodes.AsNoTracking()
            .SingleOrDefault(n => n.ID == nodeID);
        if(node == null) {
            throw EntrySpecifiedByIDDoesNotExis();
        }
        if(node.IsBlackBox) {
            throw new InvalidClientDataException(
                "Services are unavailable for 'Black Box' nodes.");
        }
        if(!nodeServiceOpenProperty(node)) {
            throw new InvalidClientDataException(
                $"Node's IsOpen{serviceName} property equals false.");
        }
        return new IPAddress(node.ip);
    }

    /// <exception cref="InvalidClientDataException">On invalid client input vales.</exception>
    public IPAddress GetNodeIPForPing(int id) {
        return IPForService(
            id,
            n => n.IsOpenPing,
            "Ping"
        );
    }

    /// <exception cref="InvalidClientDataException">On invalid client input vales.</exception>
    public string GetNodeIPForAppService(
        int id,
        AppServiceTypes serviceType
    ) {
        Func<NtwkNode, bool> prop = null;
        string serviceName = null;
        switch(serviceType) {
            case AppServiceTypes.Telnet:
                    prop = n => n.IsOpenTelnet;
                    serviceName = "Telnet";
                break;
            case AppServiceTypes.SSH:
                    prop = n => n.IsOpenSSH;
                    serviceName = "SSH";
                break;
            case AppServiceTypes.Web:
                    prop = n => n.IsOpenWeb;
                    serviceName = "Web";
                break;
            default:
                throw new NotImplementedException(
                    $"No implementation for {serviceType.ToString()}.");
        }
        return IPForService(id, prop, serviceName).ToString();
    }

    /// <returns>Returns parent object (may be null)</returns>
    /// <exception cref="InvalidClientDataException">On invalid client input vales.</exception>
    public SerializableNtwkNode GetNodeParent(int nodeId) {
        var node = ModelNodeOrThrowWithParent(nodeId);
        return node.Parent?.IntoSerializable();
    }

    /// <exception cref="InvalidClientDataException">On invalid client input vales.</exception>
    public IEnumerable<SerializableNtwkNode> GetNodeChildren(int nodeId) {
        var children = ModelNodeChildrenOrThrow(nodeId);
        return children.Select(n => n.IntoSerializable());
    }

    public IEnumerable<SerializableNtwkNode> GetRootChildren() {
        return db.Nodes.AsNoTracking()
            .Include(n => n.Parent)
            .Where(n => n.Parent == null)
            .Select(n => n.IntoSerializable());
    }

    /// <exception cref="InvalidClientDataException">On invalid client input vales.</exception>
    public IEnumerable<SerializableNtwkNode> GetNodesOfType(int typeVal) {
        var type = DBModelSerializationUtils.NodeTypeFromValueOrNull(typeVal);
        if(type == null) {
            throw new InvalidClientDataException(
                "Trying to get nodes of nonexistent type.");
        }
        return db.Nodes.AsNoTracking()
            .Include(n => n.Parent)
            .Where(n => n.Type == type)
            .Select(n => n.IntoSerializable());
    }

    /// <exception cref="InvalidClientDataException">On invalid client input vales.</exception>
    public SerializableNtwkNode CreateNode(SerializableNtwkNode node, int parentID = 0) {
        if(node.ID == 0) {
            var modelNode = new NtwkNode();
            try {
                modelNode.CopyFromSerializable(node);
            }
            catch(FormatException) {
                throw new InvalidClientDataException("Incorrect ip address format.");
            }
            if(parentID == 0) { //root children
                db.Nodes.Add(modelNode);
                db.SaveChanges();
            }
            else {
                var bruddas = db.Nodes.Include(n => n.Children)
                    .SingleOrDefault(n => n.ID == parentID)?.Children;
                if(bruddas == null) {
                    throw new InvalidClientDataException(
                        "Trying to create node with nonexisting parent.");
                }
                bruddas.Add(modelNode);
                db.SaveChanges();
            }
            return db.Nodes.AsNoTracking()
                .Include(n => n.Parent)
                .Single(n => n.ID == modelNode.ID)
                .IntoSerializable();
        }
        else {
            throw new InvalidClientDataException(
                "Only entries with ID=0 are accepted.");
        }
    }

    /// <exception cref="InvalidClientDataException">On invalid client input vales.</exception>
    public void UpdateNode(SerializableNtwkNode node, int parentID = 0) {
        if(node.ID != 0) {
            NtwkNode entry = db.Nodes
                .Include(n => n.Parent)
                .SingleOrDefault(n => n.ID == node.ID);
            NtwkNode parent = null;
            if(entry == null) {
                throw new InvalidClientDataException(
                    "Can't update nonexisting node");
            }
            if(parentID != 0) {
                parent = db.Nodes.Find(parentID);
                if(parent == null) {
                    throw new InvalidClientDataException(
                        "Trying to set node's parent to nonexistent entry."
                    );
                }
            }
            try {
                entry.CopyFromSerializable(node);
            }
            catch(FormatException) {
                throw new InvalidClientDataException("Incorrect ip address format.");
            }
            if(parent != null) {
                entry.Parent = parent;
            }
        }
        db.SaveChanges();
    }

    /// <exception cref="InvalidClientDataException">On invalid client input vales.</exception>
    public SerializableNtwkNode RemoveNode(int id) {
        NtwkNode node = db.Nodes
            .Include(n => n.Parent)
            .Include(n => n.Children)
            .SingleOrDefault(n => n.ID == id);
        if(node == null) {
            throw new InvalidClientDataException(
                "Entry specified by ID does not exist.");
        }
        if(node.Children.Any()) {
            throw new InvalidClientDataException(
                "Removing entries with child entries is prohibited.");
        }
        db.Nodes.Remove(node);
        db.SaveChanges();
        return node.IntoSerializable();
    }

    /*
    public void TestNodesPopulation() {
        //seriously bad testing right here
        //if(
            //db.Nodes.Count()!=1
            // || (db.Nodes.Single().ip != (int)IPAddress.Parse("10.1.0.1").Address
            //&& db.Nodes.Single().IsOpenPing == true)
        //) return;
        var server = new SerializableNtwkNode() {
            ID = 1,
            Type = NodeType.Server,
            Name = "TestServer",
            IsBlackBox = false,
            ipStr = "10.1.0.1",
            IsOpenSSH = true,
            IsOpenTelnet = false,
            IsOpenWeb = false,
            IsOpenPing = true
        };
        UpdateNode(server);
        var sw = new SerializableNtwkNode() {
            ID = 2,
            Type = NodeType.ClientSwitch,
            Name = "TestSwitch",
            IsBlackBox = false,
            ipStr = "192.168.222.250",
            IsOpenSSH = false,
            IsOpenTelnet = true,
            IsOpenWeb = true,
            IsOpenPing = true
        };
        UpdateNode(sw);
        var swNonexisting = new SerializableNtwkNode() {
            ID = 3,
            Type = NodeType.ClientSwitch,
            Name = "TestSwitch2",
            IsBlackBox = false,
            ipStr = "192.168.222.100",
            IsOpenSSH = false,
            IsOpenTelnet = true,
            IsOpenWeb = true,
            IsOpenPing = true
        };
        UpdateNode(swNonexisting);
    }
    */
}

}