SELECT * FROM [dbo].[get_controlstate]('ESP0001')
/*  RESULT WILL HAVE THIS FORMAT
id_equipment	name_equipment		status	mode	expect_sensor_value		last_status		_state			_status
BC0002			PumpB				1		0		80						1				200				success
BC0104			Pumpr				1		0		80						NULL			201				equipment's status not found
DHT0505			abc					1		0		80						NULL			201				equipment's status not found
*/


SELECT * FROM dbo.get_equipment_schedule('BC0002');
/*  RESULT WILL HAVE THIS FORMAT
time_offset		times				_state	_status
15				03:32:00.0000000	200		success
15				23:50:00.0000000	200		success
5				20:12:00.0000000	200		success	
5				14:12:00.0000000	200		success
15				02:48:00.0000000	200		success
20				23:59:00.0000000	200		success
20				00:10:00.0000000	200		success
20				18:08:00.0000000	200		success
*/

select * from dbo.get_farm_info('CT0001')
/*  RESULT WILL HAVE THIS FORMAT
farm_id_	farm_name_			farm_decription_	farm_state_		equipment_id_	equipment_name_		_index	sensor_id_	sensor_name_	func_state
ESP0004		Farm tr6r 2			hello				0				BC0001			dongnho				4		DHT0001		ShtB			200
ESP0001		farm cua cuong		Tr?ng rau c?i		0				BC0002			Cà rot				NULL	DHT0002		ShtB			200
ESP0001		farm cua cuong		Tr?ng rau c?i		0				BC0104			Pumpr				NULL	DHT0002		ShtB			200
ESP0001		farm cua cuong		Tr?ng rau c?i		0				BC0404			def					4		DHT0002		ShtB			200

*/