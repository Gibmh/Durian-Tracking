//------------------------------------------------------------------------------
// <auto-generated>
//     This code was generated from a template.
//
//     Manual changes to this file may cause unexpected behavior in your application.
//     Manual changes to this file will be overwritten if the code is regenerated.
// </auto-generated>
//------------------------------------------------------------------------------

namespace Cuong.Models
{
    using System;
    using System.Collections.Generic;
    
    public partial class EquipmentValue
    {
        public int id { get; set; }
        public string id_equipment { get; set; }
        public double values { get; set; }
        public double status { get; set; }
        public System.DateTime datetime { get; set; }
    
        public virtual EquipmentManagement EquipmentManagement { get; set; }
    }
}
