const { Kafka, Partitioners} = require("kafkajs");
const orderPool = require("../../orderDB");

const kafka = new Kafka({
    clientId: "orders-backend",
    brokers: ["kafka:19092"],
    retry: {
        initialRetryTime: 4000,
        retries: 5
    }
});

// Create a producer
const producer = kafka.producer({
    allowAutoTopicCreation: true,
    createPartitioner: Partitioners.LegacyPartitioner
});

// Method to connect as a producer and send a message in the ordersProducer topic
const sendOrders = async (msg)=>{
    await producer.connect();
    await producer.send({
        topic: "ordersProducer",
        messages: [{
            value: JSON.stringify(msg)
        }]
    });

    await producer.disconnect();
};

// Create a consumer
const consumer = kafka.consumer({
    groupId: "orders-group",
    allowAutoTopicCreation: true
});

/* Method to connect the consumer to the productsProducer topic, read messages posted there
and update the status of the order from Pending to either Accepted or Rejected.
*/
const fetchStatusFromProductTopic = async () => {
    try {
        await consumer.connect();
        await consumer.subscribe({ topic: "productsProducer", fromBeginning: true });

        await consumer.run({
            eachMessage: async ({message}) => {
                const jsonMsg = JSON.parse(message.value);
                await orderPool.query("UPDATE orders SET status = $1 WHERE id = $2", [jsonMsg.status, jsonMsg.id]);
            }
        });
    } catch (error) {
        await consumer.disconnect();
        console.log(error.message);
    }
};

module.exports = {
    sendOrders,
}

setTimeout(async ()=>{
    try {
        await fetchStatusFromProductTopic()
    } catch (error) {
        console.log(error.message)
    }
    },10000);