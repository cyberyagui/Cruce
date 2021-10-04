const mongoose = require('mongoose');
const { Schema } = mongoose;

const clientAddressSchema = new Schema({
    province : String,
    city: String,
    addressType: String,
    receiverName: String,
    street : String,
    numberStreet : Number,
    complement : String,
    neighborhood : String,
    postalCode: Number,
})

const clientSchema = new Schema({
    firstName: String,
    lastName : String,
    document : Number,
    email: String,
    phone: Number,
    address: clientAddressSchema
})

//Ver tipo date por Excel
const productSchema = new Schema({
   courrier: String,
   estimateDeliveryDate: Date,
   deliveryDeadline : String,
   status : String, 
   paymentSystem: String,
   installments: Number,
   paymentValue: String,
   quantity : Number,
   productId : Number,
   categoryId : String,
   referenceCode : String,
   productName: String,
   productsValue : Number,
   sellingPrice : Number,
   totalPrice : Number,
   shippingPrice: Number,
   shippingValue : Number,
   totalValue: Number,
   discountsTotals: Number
})

const stateSchema = new Schema({
    state : String,
    date : Date,
})

//---------------------------------
//Verificar el ActualState con hook

const orderSchema = new Schema({
    orderId : String,
    client : clientSchema,
    product : [productSchema],
    observations : String,
    branchId : {
        type : Schema.Types.ObjectId,
        ref: "Branch"
    },
    userId : {
        type: Schema.Types.ObjectId,
        ref: "User"
    },
    courierId: {
        type: Schema.Types.ObjectId,
        ref : "Courier"
    },
    stateHistory : [stateSchema],

    //**********/
    actualState : {
        type : String,
        default: "sin asignar",
        lowercase : true
    }
    //*********/
})


orderSchema.pre("save", function () {

    this.stateHistory.push({
      state: this.actualState,
      date: new Date(),
    });
  //   console.log("Hello from pre save", this);
});

const Order = mongoose.model("Order", orderSchema)

module.exports = Order
