import paho.mqtt.client as mqtt

# Cấu hình thông tin của MQTT broker
broker_url = "broker.emqx.io"  # Thay thế bằng URL của MQTT broker của bạn
broker_port = 1883  # Cổng MQTT (mặc định là 1883)
topic = "FlyBug__sensorData"  # Thay thế bằng topic mà bạn muốn nhận dữ liệu

# Hàm được gọi khi kết nối thành công tới broker
def on_connect(client, userdata, flags, rc):
    print(f"Connected with result code {rc}")
    # Đăng ký topic sau khi kết nối thành công
    client.subscribe(topic)

# Hàm được gọi khi nhận thông điệp mới từ topic
def on_message(client, userdata, msg):
    # msg.payload chứa dữ liệu nhận được, cần chuyển đổi từ bytes thành chuỗi
    message = msg.payload.decode('utf-8')
    print(f"Received message from topic '{msg.topic}': {message}")

    # Nếu message là JSON, có thể parse thành đối tượng Python
    try:
        import json
        json_data = json.loads(message)
        print("Parsed JSON:", json_data)
    except json.JSONDecodeError:
        print("Message is not in valid JSON format")

# Tạo một client MQTT
client = mqtt.Client()

# Đặt các hàm callback
client.on_connect = on_connect
client.on_message = on_message

# Kết nối tới MQTT broker
client.connect(broker_url, broker_port, 60)

# Vòng lặp để duy trì kết nối và nhận thông điệp
client.loop_forever()
