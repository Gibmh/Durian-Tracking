using Cuong.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Web.Http;

namespace Cuong.Controllers
{

    public class ValuesController : ApiController
    {
        private ngunemay123_SampleDBEntities7 db = new ngunemay123_SampleDBEntities7();


        // GET: api/Users
        public IActionResult Index()
        {
            var esps = db.Users
                               .Where(e => e.id_user == "ESP0001")
                               .Select(e => new
                               {
                                   e.id_user,

                                   // Thêm các cột khác bạn muốn chọn
                               })
                               .ToList();



            return (IActionResult)Json(esps); // Trả về danh sách các cột đã chọn dưới dạng JSON
        }



        // GET api/cuong
        public IEnumerable<object> Get()
        {
            var esps = db.Users
                    .Where(e => e.id_user == "CT0001")
                    .Select(e => new
                    {
                        e.id_user,
                        e.membership
                        // Thêm các cột khác bạn muốn chọn
                    })
                    .ToList();



            return esps;
        }

        // GET api/values/5
        public string Get(int id)
        {
            return "value";
        }

        // POST api/values
        public void Post([FromBody] string value)
        {
        }

        // PUT api/values/5
        public void Put(int id, [FromBody] string value)
        {
        }

        // DELETE api/values/5
        public void Delete(int id)
        {
        }
    }
}
