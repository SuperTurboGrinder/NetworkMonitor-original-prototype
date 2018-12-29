using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using System.Net;
using System.Net.NetworkInformation;

using NtwkMonitor.Server.Model.Serialization;
using NtwkMonitor.Server.Exceptions;
using NtwkMonitor.Server.Abstract;

namespace NtwkMonitor.Server.Controllers {

[Route("nodes/data")]
public class NodesDataController : Controller {
    readonly INtwkDBRepository repo;

    public NodesDataController(INtwkDBRepository dbRepository) {
        repo = dbRepository;
    }

    // GET nodes/data/types
    [HttpGet("types")]
    public IEnumerable<string> GetNodeTypes() {
        return repo.GetAllTypes();
    }

    // GET nodes/data/all
    [HttpGet("all")]
    public IEnumerable<SerializableNtwkNode> GetAll() {
        return repo.GetAllNodes();
    }

    // GET nodes/data/3
    [HttpGet("{id:int}")]
    public IActionResult GetNode(int id) {
        return RepoOpOrBadRequest(
            () => repo.GetNode(id));
    }

    // GET nodes/data/3/parent
    [HttpGet("{id:int}/parent")]
    public IActionResult GetNodeParent(int id) {
        return RepoOpOrBadRequest(
            () => repo.GetNodeParent(id));
    }

    // GET nodes/data/3/children
    [HttpGet("{id:int}/children")]
    public IActionResult GetNodeChildren(int id) {
        return RepoOpOrBadRequest(
            () => repo.GetNodeChildren(id));
    }

    // GET nodes/data/root/children
    [HttpGet("root/children")]
    public IEnumerable<SerializableNtwkNode> GetRootChildren() {
        return repo.GetRootChildren();
    }

    // GET nodes/data/byType/3
    [HttpGet("byType/{typeVal:int}")]
    public IActionResult GetNodesByType(int typeVal) {
        return RepoOpOrBadRequest(
            () => repo.GetNodesOfType(typeVal));
    }

    // POST nodes/data/create
    [HttpPost("create")]
    public IActionResult CreateNode([FromBody]SerializableNtwkNode node) {
        return CreateNode(0, node);
    }

    // POST nodes/data/createWithParent/2
    [HttpPost("createWithParent/{parentID:int}")]
    public IActionResult CreateNode(int parentID, [FromBody]SerializableNtwkNode node) {
        SerializableNtwkNode created = null;
        try {
            created = repo.CreateNode(node, parentID);
        }
        catch(InvalidClientDataException ex) {
            return BadRequest(ex.Message);
        }
        return Created($"/nodes/data/{created.ID}", created);
    }

    // PUT nodes/data/update/3
    [HttpPut("update/{id:int}")]
    public IActionResult UpdateNode(int id, [FromBody]SerializableNtwkNode node) {
        node.ID = id;
        return UpdateNode(id, 0, node);
    }

    // PUT nodes/data/update/3/WithParent
    [HttpPut("update/{id:int}/WithParent/{parentID:int}")]
    public IActionResult UpdateNode(int id, int parentID, [FromBody]SerializableNtwkNode node) {
        node.ID = id;
        try {
            repo.UpdateNode(node, parentID);
        }
        catch(InvalidClientDataException ex) {
            return BadRequest(ex.Message);
        }
        return NoContent();
    }

    // DELETE nodes/data/remove/3
    [HttpDelete("remove/{id:int}")]
    public IActionResult Delete(int id) {
        return RepoOpOrBadRequest(
            () => repo.RemoveNode(id));
    }

    [NonAction]
    private IActionResult RepoOpOrBadRequest<TResult>(
        Func<TResult> repoOp
    ) where TResult:class {
        TResult result = null;
        try {
            result = repoOp();
        }
        catch(InvalidClientDataException ex) {
            return BadRequest(ex.Message);
        }
        return Ok(result);
    }
}

}
