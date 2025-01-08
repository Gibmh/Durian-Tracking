EXEC dbo.insert_device_pro N'
	{
		"id_esp":"ESP0001",
		"device":
			 [
				{
					"id":"PH0004",
					"name":"abc",
					"id_equipment":"BC0404",
					"type":"Sensor"
				},
				{	
				    "id":"BC0404",
				    "name":"def",
					"_index": 4,
				    "type":"Equipment"
				}
			]
		
	}
	';
--EXPECT RESULT state	status
--				203		id sensor and id equipment has been exists

EXEC dbo.edit_equipment_pro 'BC0001' , 'ESP0004', 'dongnho',4
--EXPECT RESULT state	status
--				200		success



EXEC [dbo].[insert_schedule_pro] 'BC0001',14,'03:32:00';
/*
	EXPECT RESULT
	_state	_status
	200		'success'
*/


EXEC dbo.edit_schedule_pro 'BC0001', 20;
/*	EXPECT RESULT
	_state	_status
	200		'success'
*/


EXEC dbo.edit_schedule_pro 'BC0001', 20;
EXEC dbo.edit_schedule_pro 'BC0001',@old_time ='03:32:00',@new_time = '03:34:00';--use 2 last arguement with out using @offset
/*	EXPECT RESULT
	_state	_status
	200		'success'
*/


EXEC dbo.delete_schedule_pro 'BC0003';
/*	EXPECT RESULT
	_state	_status
	200		success 
*/

EXEC dbo.delete_schedule_pro 'BC0001', @times ='23:59:00.0000000'--just use times arguement
EXEC dbo.delete_schedule_pro 'BC0001', 20 --just use offset

/*	EXPECT RESULT
	_state	_status
	200		success
*/


--arguement's list
/*
@id_esp varchar(23),
@new_id_user varchar(20) =NULL,
@new_name_esp VARCHAR(20) = NULL,
@new_description VARCHAR(100) = NULL,
@new_latitude float =NULL,
@new_longtitude float = NULL
*/
EXEC dbo.edit_farm_pro '202403215' ,@new_name_esp = 'dongnho'



EXEC dbo.edit_esp_last_status_pro '202403215' , '"a" : "abc"'
/*	EXPECT RESULT
	_state	_status
	200		success
*/

EXEC dbo.edit_btn_status_pro 'BC0001', 0
/*	EXPECT RESULT
	_state	_status
	200		success
*/


/*
arguement's list

@id_equipment VARCHAR(23),
@btn_status INT,
@mode SMALLINT,
@expect_sensor_value FLOAT
*/
EXEC dbo.edit_last_state_pro 'BC0001',1,1,81
/*	EXPECT RESULT
	_state	_status
	200		success
*/

/* add farm parameters:
	@farm_id varchar(23) ,
	@user_id varchar(20) ,
	@farm_name nvarchar(20)= NULL,
	@decription nvarchar(100)= NULL,
	@latitude float= NULL,
	@longtitude float= NULL,
	@_state varchar(10) = NULL
*/

EXEC [dbo].[add_farm_pro] 'ESP0032' ,'CT0001'
/*	EXPECT RESULT
	_state	_status
	200		success
*/
EXEC dbo.edit_esp_user_pro 'CT0002', '240323110428'
/*	Success RESULT
	_state	_status
	200		success
	FAILED RESULT
	202		Can not change user 
*/
