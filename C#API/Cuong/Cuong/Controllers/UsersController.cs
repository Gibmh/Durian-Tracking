using Cuong.Models;
using Newtonsoft.Json.Linq;
using System;
using System.Collections.Generic;
using System.Data;
using System.Data.Entity;
using System.Data.Entity.Infrastructure;
using System.Data.Entity.Validation;
using System.Globalization;
using System.Linq;
using System.Net;
using System.Threading.Tasks;
using System.Web.Http;
using System.Web.Http.Description;

namespace Cuong.Controllers
{


    public class UsersController : ApiController
    {
        private ngunemay123_SampleDBEntities7 db = new ngunemay123_SampleDBEntities7();


        // GET: api/Users
        [Route("api/login/{email}/{password}")]
        [HttpGet]
        public IEnumerable<object> Get(string email, string password)
        {
            List<object> User_info = new List<object>();
            var user = db.Users
                   .Where(e => e.gmail == email && e.password == password)
                   .Select(e => new
                   {
                       e.id_user,
                       e.gmail,
                       e.password,
                       e.name,
                       e.phone_no,
                       e.membership
                   })
                   .FirstOrDefault();

            // Kiểm tra xem id_user có null không trước khi thực hiện chuyển đổi
            if (user != null)
            {

                string idUserValue = user.id_user;
                var id_esp = db.Esps
                               .Where(e => e.id_user == idUserValue)
                               .Select(e => new
                               {
                                   e.id_esp,
                                   e.name_esp,
                                   e.decription
                                   // Thêm các cột khác bạn muốn chọn
                               }).ToList();
                if (id_esp != null)
                {
                    JObject esp = new JObject();
                    JObject user_json = new JObject();
                    user_json["id"] = user.id_user;
                    user_json["gmail"] = user.gmail;
                    user_json["password"] = user.password;
                    user_json["name"] = user.name;
                    user_json["phone"] = user.phone_no;
                    user_json["membership"] = user.membership;
                    esp["user"] = user_json;
                    int count = 0;
                    JObject equip = new JObject();
                    JObject equipmentlist = new JObject();
                    foreach (var item in id_esp)
                    {
                        JObject bc = new JObject();
                        JObject sensor = new JObject();
                        string idEquidment = item.id_esp;
                        var countbc = db.EquipmentManagements
                        .Where(e => e.id_esp == idEquidment && e.id_equipment.StartsWith("BC"))
                        .Select(e => new
                        {
                            e.id_equipment,
                            e.name_equipment
                           
                            // Thêm các cột khác bạn muốn chọn
                        }).ToList();
                        var countdht = db.SensorManagements
                        .Where(e => e.id_esp == idEquidment)
                        .Select(e => new
                        {
                            e.id_sensor,
                            e.name_sensor
                            // Thêm các cột khác bạn muốn chọn
                        }).ToList();
                        int count_bc_item = 0;
                        foreach (var bc_item in countbc)
                        {
                            JObject bc_json = new JObject();
                            bc_json["id_bc"] = bc_item.id_equipment;
                            bc_json["name_bc"] = bc_item.name_equipment;
                            

                            bc[count_bc_item.ToString()] = bc_json;

                            count_bc_item++;
                        }
                        bc["sl"] = count_bc_item;

                        int count_dht_item = 0;
                        int count_ph_item = 0;
                        int count_sensor_item = 0;

                        foreach (var sensor_item in countdht)
                        {
                            if ((sensor_item.id_sensor).StartsWith("DHT"))
                            {
                                JObject dht_json = new JObject();
                                dht_json["id_dht"] = sensor_item.id_sensor;
                                dht_json["name_dht"] = sensor_item.name_sensor;
                                sensor[count_sensor_item.ToString()] = dht_json;
                                count_dht_item++;
                            }
                            else
                            {
                                JObject ph_json = new JObject();
                                ph_json["id_ph"] = sensor_item.id_sensor;
                                ph_json["name_ph"] = sensor_item.name_sensor;
                                sensor[count_sensor_item.ToString()] = ph_json;
                                count_ph_item++;
                            }
                            
                            count_sensor_item++;

                        }
                        sensor["sl_dht"] = count_dht_item;
                        sensor["sl_ph"] = count_ph_item;
                        JObject json = new JObject();
                        json["id_esp"] = item.id_esp;
                        
                        json["name"] = item.name_esp;
                        json["decription"] = item.decription;
                        json["bc"] = bc;
                        json["sensor"] = sensor;
                        equipmentlist[count.ToString()] = json;
                        esp["equipment"] = equipmentlist;
                        count++;
                    }

                    User_info.Add(esp); 
                    return User_info;
                }
                else return User_info;
            }
            else return null;

        }


        [Route("api/isconect/{id_user}")]
        [HttpGet]
        public IEnumerable<Object> isconnect(string id_user)
        {


            List<object> User_info = new List<object>();

            var id_esp = db.Esps
                   .Where(e => e.id_user == id_user)
                   .Select(e => new
                   {
                       e.id_esp

                       // Thêm các cột khác bạn muốn chọn
                   }).ToList();

            JObject json = new JObject();
            int count = 0;
            foreach (var item in id_esp)
            {

                var id_sensor = db.SensorManagements
                       .Where(e => e.id_esp == item.id_esp && e.id_sensor.StartsWith("DHT"))
                       .Select(e => new
                       {
                           e.id_sensor

                           // Thêm các cột khác bạn muốn chọn
                       }).FirstOrDefault();

                var datetiem = db.SensorValues
                   .Where(e => e.id_sensor == id_sensor.id_sensor)
                   .OrderByDescending(e => e.id)
                   .Take(1)
                   .Select(e => new
                   {
                       e.datetime
                       //datetime1 = e.datetime
                       // Thêm trường select khác nếu cần thiết
                   })
                   .FirstOrDefault();


                json["esp" + count.ToString()] = datetiem.datetime;
                count++;

            }
            User_info.Add(json);
            return User_info;

        }



        [Route("api/getlog")]
        [HttpGet]
        public IEnumerable<Object> getlog()
        {


            List<object> User_info = new List<object>();

            var id_esp = db.EquipmentValueLogs
                   .Where(e => e.id_equipment == "DHT0001")
                   .Select(e => new
                   {
                       e.id_equipment,
                       e.values

                       // Thêm các cột khác bạn muốn chọn
                   }).ToList();

            User_info.Add(id_esp);
            return User_info;

        }



        [Route("api/getsensorvalue/{id_esp}")]
        [HttpGet]
        /*
         [
    {
        "combo0": {
            "DHT": {
                "0": {
                    "id": "DHT0001",
                    "value": 10.5,
                    "datatime": "2024-04-07T10:00:00"
                },
                "1": {
                    "id": "DHT0001",
                    "value": 17.0,
                    "datatime": "2024-04-02T14:00:50.447"
                },
                "2": {
                    "id": "DHT0001",
                    "value": 16.0,
                    "datatime": "2024-04-02T14:00:45.857"
                },
                "3": {
                    "id": "DHT0001",
                    "value": 14.0,
                    "datatime": "2024-04-02T14:00:40.367"
                },
                "4": {
                    "id": "DHT0001",
                    "value": 12.0,
                    "datatime": "2024-04-02T14:00:35.367"
                }
            },  
            "PH": {
                "0": {
                    "id": "PH0001",
                    "value": 22.0,
                    "datatime": "2024-04-02T14:00:50.447"
                },
                "1": {
                    "id": "PH0001",
                    "value": 21.0,
                    "datatime": "2024-04-02T14:00:45.447"
                },
                "2": {
                    "id": "PH0001",
                    "value": 20.0,
                    "datatime": "2024-04-02T14:00:40.447"
                },
                "3": {
                    "id": "PH0001",
                    "value": 19.0,
                    "datatime": "2024-04-02T14:00:35.447"
                },
                "4": {
                    "id": "PH0001",
                    "value": 17.0,
                    "datatime": "2024-04-02T14:00:30.447"
                }
            }
        },
        "combo1": {
            "DHT": {
                "0": {
                    "id": "DHT0002",
                    "value": 44.0,
                    "datatime": "2024-04-02T14:00:50.447"
                },
                "1": {
                    "id": "DHT0002",
                    "value": 43.0,
                    "datatime": "2024-04-02T14:00:45.447"
                },
                "2": {
                    "id": "DHT0002",
                    "value": 42.0,
                    "datatime": "2024-04-02T14:00:40.447"
                },
                "3": {
                    "id": "DHT0002",
                    "value": 41.0,
                    "datatime": "2024-04-02T14:00:35.447"
                },
                "4": {
                    "id": "DHT0002",
                    "value": 40.0,
                    "datatime": "2024-04-02T14:00:30.447"
                }
            },
            "PH": {
                "0": {
                    "id": "PH0002",
                    "value": 24.0,
                    "datatime": "2024-04-02T14:00:50.447"
                },
                "1": {
                    "id": "PH0002",
                    "value": 23.0,
                    "datatime": "2024-04-02T14:00:45.447"
                },
                "2": {
                    "id": "PH0002",
                    "value": 22.0,
                    "datatime": "2024-04-02T14:00:40.447"
                },
                "3": {
                    "id": "PH0002",
                    "value": 21.0,
                    "datatime": "2024-04-02T14:00:35.447"
                },
                "4": {
                    "id": "PH0002",
                    "value": 20.0,
                    "datatime": "2024-04-02T14:00:30.447"
                }
            }
        }
    }
]
         */
        public IEnumerable<Object> getsensorvalue(string id_esp)
        {
            List<object> Esp_value = new List<object>();
            var id_equipment = db.EquipmentManagements
                   .Where(e => e.id_esp == id_esp)
                   .Select(e => new
                   {
                       e.id_equipment,
                       e.id_sensor,
                   })
                   .ToList();
            int count = 0;
            JObject total = new JObject();
            foreach (var item in id_equipment)
            {
                JObject sensor = new JObject();
                string[] parts = item.id_sensor.Split('-');
                List<string> sensorcategorys = new List<string>();
                List<string> sensor_ids = new List<string>();
                foreach (string part in parts)
                {
                    sensor_ids.Add(part);
                    string lettersOnly = new string(part.Where(char.IsLetter).ToArray());
                    if (!string.IsNullOrEmpty(lettersOnly))
                    {
                        sensorcategorys.Add(lettersOnly);
                    }
                }
                int count_sensor_id = 0;
                foreach (var sensor_id in sensor_ids)
                {
                    JObject sensorname_json = new JObject();
                    var sensor_values = db.SensorValues
                          .Where(e => e.id_sensor == sensor_id)
                          .OrderByDescending(e => e.id)
                          .Take(6)
                          .Select(e => new
                          {
                              e.value,
                              e.datetime
                          }).ToList();
                    int count_sensor_value = 0;
                    sensorname_json["id"] = sensor_id;
                    foreach (var sensor_value in sensor_values)
                    {
                        JObject sensorvalue_json = new JObject();
                        sensorvalue_json["value"] = sensor_value.value;
                        sensorvalue_json["datetime"] = sensor_value.datetime;
                        sensorname_json[count_sensor_value.ToString()] = sensorvalue_json;
                        count_sensor_value++;
                    }
                    sensor[sensorcategorys[count_sensor_id]] = sensorname_json;
                    count_sensor_id++;
                }
                total["combo" + count.ToString()] = sensor;
                count++;
            }
            Esp_value.Add(total);
            return Esp_value;
        }


        [Route("api/getvalueequipment/{id_esp}")]
        [HttpGet]
        public IEnumerable<Object> getvalueequipment(string id_esp)
        {
            List<object> equipment_value = new List<object>();
            JObject total = new JObject();
            var id_equipment = db.EquipmentManagements
                   .Where(e => e.id_esp == id_esp)
                   .Select(e => new
                   {
                       e.id_equipment,
                       e.name_equipment,
                       e.automode,
                       e.id_sensor
                   })
                   .ToList();
            int count_equipment = 0;
            foreach (var equipment in id_equipment)
            {
                JObject equipment_json = new JObject();
                JObject schedule_json = new JObject();

                //var status = db.EquipmentValues
                //   .Where(e => e.id_equipment == equipment.id_equipment)
                //   .OrderByDescending(e => e.id)
                //   .Take(1)
                //   .Select(e => new
                //   {
                //       e.status
                //   })
                //   .FirstOrDefault();
                //string[] parts = equipment.id_sensor.Split('-');
                //var id_sensor_dht = "";
                //foreach (string part in parts)
                //{

                //    string lettersOnly = new string(part.Where(char.IsLetter).ToArray());
                //    if (!string.IsNullOrEmpty(lettersOnly) && lettersOnly == "DHT")
                //    {
                //        id_sensor_dht = part;
                //    }
                //}
                //var expect_value = db.SensorManagements
                //   .Where(e => e.id_sensor == id_sensor_dht)
                //   .Select(e => new
                //   {
                //       e.expectedValues
                //   })
                //   .FirstOrDefault();
                //equipment_json["name"] = equipment.name_equipment;
                //equipment_json["automode"] = equipment.automode;
                //equipment_json["expect_value"] = expect_value.expectedValues;
                equipment_json["id_bc"] = equipment.id_equipment;
                equipment_json["name"] = equipment.name_equipment;



                var schedules = db.EquipmentSchedules
                   .Where(e => e.id_equipment == equipment.id_equipment)
                   .Select(e => new
                   {
                       e.times,
                       e.times_offset
                   })
                   .ToList();
                int count_schedule = 0;
                foreach (var schedule in schedules)
                {
                    JObject json = new JObject();
                    json["time"] = schedule.times;
                    json["offset"] = schedule.times_offset;
                    schedule_json[count_schedule.ToString()] = json;
                    count_schedule++;
                }
                equipment_json["schedule"] = schedule_json;
                total[count_equipment.ToString()] = equipment_json;
                count_equipment++;
            }
            equipment_value.Add(total);
            return equipment_value;

        }


        [Route("api/getvalueesp/{id_esp}")]
        [HttpGet]
        public IEnumerable<Object> GetValueEsp(string id_esp)
        {
            List<object> getvalueesp = new List<object>();
            JObject json = new JObject();

            var id_equipment = db.EquipmentManagements
                   .Where(e => e.id_esp == id_esp)
                   .Select(e => new
                   {
                       id = e.id_equipment,
                       
                       id_sensor = e.id_sensor,
                       id_bc = e.id_equipment,
                       // Thêm trường select khác nếu cần thiết
                   })
                   .ToList();
            //getvalueesp.Add(id_equipment);
            int count = 0;
            foreach (var eqipment in id_equipment)
            {
            JObject json2 = new JObject();

               



                var schedule_value = db.EquipmentSchedules
                   .Where(e => e.id_equipment == eqipment.id)
                   .Select(e => new
                   {
                       e.times,

                   })
                   .ToList();
                JObject json_schedule = new JObject();
                int count_schedule = 0;

                foreach (var schedule in schedule_value)
                {

                    json_schedule[count_schedule.ToString()] = schedule.times;
                    //json_schedule["schedule"] = jsonschedule;
                    count_schedule++;
                }
                
                json2["id_sensor"] = eqipment.id_sensor;
                json2["id_bc"] = eqipment.id_bc;

                json2["schedule"] = json_schedule;

                json["equiment" + count.ToString()] = json2;
                

                count++;
            }
            getvalueesp.Add(json);




            return getvalueesp;
        }


        [Route("api/getuserbyemail/{email}")]
        [HttpGet]
        public IEnumerable<Object> GetUserByEmail(string email)
        {
            string emaildot = email.Replace(',', '.');

            List<object> User_info = new List<object>();
            var user = db.Users
                   .Where(e => e.gmail == emaildot)
                   .Select(e => new
                   {
                       e.id_user,
                       e.gmail,
                   })
                   .FirstOrDefault();
            User_info.Add(user);
            // Kiểm tra xem id_user có null không trước khi thực hiện chuyển đổi
            if (user != null)
            {
                return User_info;

            }
            else return null;

        }


        [Route("api/history/{id_esp}/{strtimebegin}/{strtimeend}")]
        [HttpGet]
        public IEnumerable<object> GetHistory(string id_esp, string strtimebegin, string strtimeend)
        {

            string[] timebegin_split = strtimebegin.Split('-');
            string[] timeend_split = strtimeend.Split('-');

            int[] timebegin_split_int = Array.ConvertAll(timebegin_split, int.Parse);
            int[] timeend_split_int = Array.ConvertAll(timeend_split, int.Parse);

            DateTime timebegin = new DateTime(timebegin_split_int[0], timebegin_split_int[1], timebegin_split_int[2], timebegin_split_int[3], timebegin_split_int[4], timebegin_split_int[5]);
            DateTime timeend = new DateTime(timeend_split_int[0], timeend_split_int[1], timeend_split_int[2], timeend_split_int[3], timeend_split_int[4], timeend_split_int[5]);
            //string dateString = "2024-03-21-14-59-59"; // Chuỗi thời gian cần chuyển đổi

            var equipmentList = db.EquipmentManagements
            .Where(e => e.id_esp == id_esp)
            .Select(e => new
            {
                e.id_equipment,
                e.name_equipment // Thêm trường cần lấy vào đây
            })
            .ToList();

            // Sau đó sử dụng equipmentList trong các truy vấn sau
            var id_equidments = equipmentList.Select(e => e.id_equipment).ToList();

            // Kiểm tra xem id_user có null không trước khi thực hiện chuyển đổi
            if (id_equidments != null)
            {

                List<object> EquidmentHistory = new List<object>();
                JObject total = new JObject();
                JObject total_equip  = new JObject();
                JObject total_schedule = new JObject();


                var equidment_value = db.EquipmentValues
                                        .Where(e => id_equidments.Contains(e.id_equipment) && e.status == 1 && (e.datetime >= timebegin && e.datetime <= timeend))
                                        .Select(e => new
                                        {
                                            e.id_equipment,
                                            e.datetime,

                                        })
                                        .OrderByDescending(e => e.datetime)
                                        .ToList();
                int count = 0;
                foreach(var item in equipmentList)
                {
                    JObject equipment = new JObject();
                    equipment["id"] = item.id_equipment;
                    equipment["name"] = item.name_equipment;

                    total_equip["equipment" + count.ToString()] = equipment;
                    count++;
                }
                int count_schedule = 0;
                foreach (var item in equidment_value)
                {
                    JObject schedule  = new JObject();
                    schedule["id_equipment"] = item.id_equipment;
                    schedule["datetime"] = item.datetime;

                    total_schedule[count_schedule.ToString()] = schedule;
                    count_schedule++;
                }
                total["equipment"] = total_equip;
                total["schedule"] = total_schedule;

                EquidmentHistory.Add(total);


                return EquidmentHistory;
            }
            else return new List<object>();

        }


        // GET: api/Users/5
        [ResponseType(typeof(User))]
        public IHttpActionResult GetUser(string id)
        {
            User user = db.Users.Find(id);
            if (user == null)
            {
                return NotFound();
            }

            return Ok(user);
        }


        [Route("api/userchangepassword")]
        [HttpPut]
        [ResponseType(typeof(void))]
        public IHttpActionResult ChangPasswordUser()
        {

            var content = Request.Content.ReadAsStringAsync().Result;

            // Giải mã dữ liệu từ body thành các thông tin cần thiết
            var json = JObject.Parse(content);
            string gmail = json["gmail"].ToString();
            string password = json["password"].ToString();

            if (gmail == null || password == null)
            {
                return BadRequest();
            }

            var user = db.Users
                .Where(e => e.gmail == gmail)
                 .FirstOrDefault();

            var entity = db.Users.FirstOrDefault(e => e.gmail == gmail);
            if (entity == null)
            {
                return BadRequest("error");
            }
            else
            {
                entity.id_user = user.id_user;
                entity.gmail = user.gmail;
                entity.phone_no = user.phone_no;
                entity.name = user.name;
                entity.date_created = user.date_created;
                entity.membership = user.membership;
                entity.password = password;
                db.SaveChanges();
                return Ok("success");
            }



        }


        [Route("api/updateautomode")]
        [HttpPut]
        [ResponseType(typeof(void))]
        /*
        {
        "id_equipment":"BC0001",
        "automode":1
         }
         */
        public IHttpActionResult UpdateAutoMode()
        {
            var content = Request.Content.ReadAsStringAsync().Result;
            // Giải mã dữ liệu từ body thành các thông tin cần thiết
            var json = JObject.Parse(content);
            string id_equipment = json["id_equipment"].ToString();
            string automode = json["automode"].ToString();
            if (id_equipment == null || automode == null)
            {
                return BadRequest("variables can't be null");
            }
            var update_automode = db.EquipmentManagements.FirstOrDefault(e => e.id_equipment == id_equipment);
            if (update_automode == null)
            {
                return BadRequest("can not find equipment");   
            }
            else
            {
                update_automode.automode = int.Parse(automode);
                db.SaveChanges();
                return Ok("success");
            }
        }


        [Route("api/updateexpectedvalue")]
        [HttpPut]
        [ResponseType(typeof(void))]
        /*
        {
        "id_sensor":"DHT0001",
        "expected": 10
        }
        */
        public IHttpActionResult UpdateExpectedValue()
        {
            var content = Request.Content.ReadAsStringAsync().Result;
            var json = JObject.Parse(content);
            string id_sensor = json["id_sensor"].ToString();
            string expected = json["expected"].ToString();
            if (id_sensor == null || expected == null)
            {
                return BadRequest("variables can't be null");
            }

            
            var update_expected = db.SensorManagements.FirstOrDefault(e => e.id_sensor == id_sensor);
            if (update_expected == null)
            {
                return BadRequest("can not find sensor");
            }
            else
            {
                update_expected.expectedValues = int.Parse(expected);
                db.SaveChanges();
                return Ok("success");
            }
        }


        [Route("api/updatestatus")]
        [HttpPut]
        [ResponseType(typeof(void))]
        /*
        {
        "id_equipment":"BC0001",
        "status":1
        }
        */
        public IHttpActionResult UpdateStatus()
        {
            var content = Request.Content.ReadAsStringAsync().Result;
            var json = JObject.Parse(content);
            string id_equipment = json["id_equipment"].ToString();
            string status = json["status"].ToString();
           
            if (id_equipment == null || status == null)
            {
                return BadRequest("variables can't be null");
            }

            var update_status = db.EquipmentValues
                   .Where(e => e.id_equipment == id_equipment)
                   .OrderByDescending(e => e.id)
                   .Take(1)
                   .FirstOrDefault();
            if (update_status == null)
            {
           
                return BadRequest("can not update status");

            }
            else
            {
                update_status.status = int.Parse(status);
                db.SaveChanges();
                return Ok("success");

            }

        }


        [ResponseType(typeof(void))]
        public IHttpActionResult PutUser(string id, User user)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            if (id != user.id_user)
            {
                return BadRequest();
            }

            db.Entry(user).State = System.Data.Entity.EntityState.Modified;

            try
            {
                db.SaveChanges();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!UserExists(id))
                {
                    return NotFound();
                }
                else
                {
                    throw;
                }
            }

            return StatusCode(HttpStatusCode.NoContent);
        }


        // POST: api/Users
        [HttpPost]
        [Route("api/user")]
        [ResponseType(typeof(User))]
        public IHttpActionResult PostUser(User user)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }
            var is_user = db.Users.Where(e => e.gmail.Equals(user.gmail)).FirstOrDefault();
            if (is_user != null)
            {
                return BadRequest("email is already use");
            }

            db.Users.Add(user);

            try
            {
                db.SaveChanges();
            }
            catch (DbEntityValidationException e)
            {
                foreach (var eve in e.EntityValidationErrors)
                {
                    Console.WriteLine("Entity of type \"{0}\" in state \"{1}\" has the following validation errors:",
                        eve.Entry.Entity.GetType().Name, eve.Entry.State);
                    foreach (var ve in eve.ValidationErrors)
                    {
                        Console.WriteLine("- Property: \"{0}\", Error: \"{1}\"",
                            ve.PropertyName, ve.ErrorMessage);
                    }
                }
                throw;
            }

            return Ok("Added Success");
        }


        // POST: api/Esps
        [HttpPost]
        [Route("api/esps")]
        [ResponseType(typeof(Esp))]
        public IHttpActionResult PostESP(Esp esp)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }
            var is_esp = db.Esps.Where(e => e.id_esp.Equals(esp.id_esp)).FirstOrDefault();
            if (is_esp != null)
            {
                return BadRequest("esp is already use");
            }
            db.Esps.Add(esp);

            try
            {
                db.SaveChanges();
            }
            catch (DbUpdateException)
            {
                return BadRequest("Can't add esp");
            }

            return Ok("Success");
        }


        [HttpPost]
        [Route("api/equidmentmanager")]
        [ResponseType(typeof(EquipmentManagement))]
        public IHttpActionResult PostEquidmentManager(EquipmentManagement equipmentmanagement)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }
            var id_equipment = db.EquipmentManagements.Where(e => e.id_equipment.Equals(equipmentmanagement.id_equipment)).FirstOrDefault();
            if (id_equipment != null)
            {
                return BadRequest("esp is already use");
            }

            db.EquipmentManagements.Add(equipmentmanagement);

            try
            {
                db.SaveChanges();
            }
            catch (DbUpdateException)
            {
                return BadRequest("can't add equipment");
            }

            return Ok("success");
        }


        [HttpPost]
        [Route("api/schedules")]
        [ResponseType(typeof(EquipmentSchedule))]
        /*
         {
        "id_equipment" : "BC0001",
        "times_offset" : 5,
        "times":"22:20:00.0000000"
         }*/
        public IHttpActionResult PostSchedules (EquipmentSchedule equipmentschedule)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest("invalid data json");
            }
            var time = db.EquipmentSchedules.Where(e => e.id_equipment.Equals(equipmentschedule.id_equipment)).ToList();

            foreach (var item in time)
            {

                if (item.times == equipmentschedule.times)
                {
                    return Ok("this time is already add");
                }
            }

            db.EquipmentSchedules.Add(equipmentschedule);

            try
            {
                db.SaveChanges();
            }
            catch (DbUpdateException)
            {
                return BadRequest("can't add equipment");
            }

            return Ok("add time success");
        }


        [HttpPost]
        [Route("api/equidmentvalues")]
        [ResponseType(typeof(EquipmentValue))]
        public IHttpActionResult PostEquidmentValues(EquipmentValue equipmentvalues)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            db.EquipmentValues.Add(equipmentvalues);

            try
            {
                db.SaveChanges();
            }
            catch (DbUpdateException)
            {
                return BadRequest("can't add equidmentvalues");
            }

            return Ok("success");
        }


        [HttpPost]
        [Route("api/sensormanager")]
        [ResponseType(typeof(SensorManagement))]
        public IHttpActionResult PostSensorManager(SensorManagement sensormanagement)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }
            var id_sensor = db.SensorManagements.Where(e => e.id_sensor.Equals(sensormanagement.id_sensor)).FirstOrDefault();
            if (id_sensor != null)
            {
                return BadRequest("sensor is already use");
            }

            db.SensorManagements.Add(sensormanagement);

            try
            {
                db.SaveChanges();
            }
            catch (DbUpdateException)
            {
                return BadRequest("can't add sensor");
            }

            return Ok("success");
        }


        [HttpPost]
        [Route("api/sensorvalues")]
        [ResponseType(typeof(SensorValue))]
        public IHttpActionResult PostSensorValues(SensorValue sensorvalue)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            db.SensorValues.Add(sensorvalue);

            try
            {
                db.SaveChanges();
            }
            catch (DbUpdateException)
            {
                return BadRequest("can't add sensor values");
            }

            return Ok("success");
        }


        [HttpDelete]
        [Route("api/equipment")]
        public async Task<IHttpActionResult> DeleteEquipment()
        {
            var content = await Request.Content.ReadAsStringAsync();
            var json = JObject.Parse(content);
            string id_equipment = json["id_equipment"].ToString();
            string time = json["times"].ToString();
            TimeSpan duration = TimeSpan.Parse(time);
            var schedule = db.EquipmentSchedules.FirstOrDefault(e => e.id_equipment == id_equipment && e.times == duration);


            db.EquipmentSchedules.Remove(schedule); // Xóa thiết bị từ cơ sở dữ liệu
            db.SaveChanges(); // Lưu các thay đổi

            return Ok("Delete success"); // Trả về mã trạng thái 200 OK nếu xóa thành công
        }



        [ResponseType(typeof(User))]
        public IHttpActionResult DeleteUser(string id)
        {
            User user = db.Users.Find(id);
            if (user == null)
            {
                return NotFound();
            }

            db.Users.Remove(user);
            db.SaveChanges();

            return Ok(user);
        }

        protected override void Dispose(bool disposing)
        {
            if (disposing)
            {
                db.Dispose();
            }
            base.Dispose(disposing);
        }

        private bool UserExists(string id)
        {
            return db.Users.Count(e => e.id_user == id) > 0;
        }
    }

    public interface IActionResult
    {
    }
}