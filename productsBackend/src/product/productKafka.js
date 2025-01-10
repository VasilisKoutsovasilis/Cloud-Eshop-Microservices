const { Kafka, Partitioners } = require("kafkajs");
const productCtrl = require("./productController");

const kafka = new Kafka({
    clientID: "products-backend",
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

// Method to send a message to the productsProducer topic
const sendOrders = async (msg)=>{
    await producer.connect();
    await producer.send({
        topic: "productsProducer",
        messages: [{
            value: JSON.stringify(msg)
        }]
    });

    await producer.disconnect();
};

// Create a consumer
const consumer = kafka.consumer({
    groupId: "products-group",
    allowAutoTopicCreation: true,
})

/* Method to connect the consumer to the ordersProducer topic, read messages posted there
and respond with Accepted for a valid order or Rejected for a non-valid.
*/
const fetchProductsFromOrderTopic = async () => {
    try {
        await consumer.connect();
        await consumer.subscribe({topic: "ordersProducer", fromBeginning: true });

        await consumer.run({
            eachMessage: async ({message}) => {
                const jsonMsg = JSON.parse(message.value);
                const result = await productCtrl.handleProducts(jsonMsg);

                if(result){
                    await sendOrders({
                        id: jsonMsg.id,
                        status: "Accepted"
                    })
                }else{
                    await sendOrders({
                        id: jsonMsg.id,
                        status: "Rejected"
                    })
                }
            }
        })
    } catch (error) {
        await consumer.disconnect();
        console.log(error.message)
    }
};

module.exports = {
    fetchProductsFromOrderTopic,
};

setTimeout(async ()=>{
    try {
        await fetchProductsFromOrderTopic()
    } catch (error) {
        console.log(error.message)
    }
    },10000);