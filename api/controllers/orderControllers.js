const { Order } = require("../models")

//Trae todos los pedidos SOLO ECOMMERCE
const allOrders = async (req, res, next) => {
    try{
        const orders= await Order.find({})
        .populate("userId")
        .populate("courierId")
        res.send(orders)
    }catch(err){next(err)}
}

//TRAE todos los pedidos de un CADETE
const myorders = async (req, res, next) => {
    try{
        const {id} = req.params
        const orders = await Order.find({userId : id})
        res.send(orders)
    }catch(err){next(err)}
}


//trae todos los pedidos SIN ASIGNAR
const noAssignedOrderList = async (req, res, next) => {
    try{
        const orders = await Order.find({actualState : "Sin Asignar"})

        res.send(orders)
    }
    catch(err){next(err)}
}


//detalla un pedido por ID
const orderById = async (req, res, next) => {
    try{
        const id = req.params.id
        const detailOrder = await Order.findById(id)
        .populate("userId")
        .populate("courierId")
        res.send(detailOrder)
    } catch(err){next(err)}
}


// Trae todos los envios de una cadetería. Puede o no recibir "estado", dependiendo del estado, traera esos pedidos
// Sino colocan estado, traerá todos los pedidos de una cadetería.
// Si es ecommerce DEBE enviar por body el courierID
const orderByCourier = async (req, res, next) => {
    try{
        const {role , courierId} = req.payload
        const {courierID, state} = req.body
        
        role === "ecommerce" ? dato = courierID : dato = courierId
        const obj = state ? {courierId : dato, actualState : state} : {courierId : dato}; 

        const orders = await Order.find(obj)
        .populate("userId")
        .populate("courierId")
        res.send(orders)
    }
    catch(err){next(err)}
}

//Trae todos los envíos y los filtra por estado SOLO ECOMMERCE 
const allOrdersByState = async (req, res, next) => {
    try{
        const {state} = req.body
        const orders = await Order.find({actualState : state})
        .populate("userId")
        .populate("courierId")
        res.send(orders)
        
    }catch(err) {next(err)}
}

//Crea todos los pedidos excel
const newOrder = async (req, res, next) => {
    try{
        const data = req.body
        
        const datosModelados = data.map(datos => 
            ({orderId : datos["Order"],
                client : {
                firstName : datos["Client Name"],
                lastName : datos["Client Last Name"],
                document : datos["Client Document"],
                email : datos["Email"],
                phone : datos["Phone"],
                address : {
                    province : datos["UF"],
                    city : datos["City"],
                    addressType : datos["Address Type"],
                    receiverName : datos["Receiver Name"],
                    street : datos["Street"],
                    numberStreet : datos["Number"],
                    complement : datos["Complement"],
                    neighborhood : datos["neighborhood"],
                    postalCode : datos["Postal Code"]
                }
            },
            product : [{
                estimateDeliveryDate : datos["Estimate Delivery Date"],
                status : datos["Status"],
                quantity : datos["Quantity_SKU"],
                productId : datos["ID_SKU"],
                categoryId : datos["Category Ids Sku"],
                referenceCode : datos["Reference Code"],
                productName : datos["SKU Name"],
                productsValue : datos["SKU Value"],
                sellingPrice : datos["SKU Selling Price"],
                totalPrice : datos["SKU Total Price"],
                shippingPrice : datos["Shipping List Price"],
                shippingValue : datos["Shipping Value"],
                totalValue : datos["Total Value"],
                discountsTotals : datos["Discounts Totals"]
            }],
            stateHistory : [
                {
                    state : "Sin Asignar",
                    date : new Date()
                }
            ]
        }))
        const nuevosDatos = datosModelados.filter(elmt => elmt.product[0].status != "Cancelado")

        for(let i = 0; i < nuevosDatos.length; i++ ){
            for(let j = i+1; j < nuevosDatos.length; j++){
                if(nuevosDatos[i].orderId === nuevosDatos[j].orderId){
                    nuevosDatos[i].product.push(nuevosDatos[j].product[0])
                    nuevosDatos.splice(j,1)
                    j = j-1
                }}}

        const ordenes = await Order.insertMany(nuevosDatos)
        res.send(ordenes)
        
    } catch(err) { next(err) }
}

//cambia el estado de un pedido y lo suma al historial
const changingState = async (req, res) => {
    const { id , courierId } = req.payload;
    const orderId = req.params.orderId
    const {newState} = req.body //Entregado o Devuelto a Sucursal

    const pedido = await Order.findById(orderId);
    if (pedido.actualState === "Sin Asignar") {
      pedido.actualState = "Pendiente de Retiro en Sucursal";
      pedido.userId = id
      pedido.courierId = courierId
    } else if (pedido.actualState === "Pendiente de Retiro en Sucursal") {
      pedido.actualState = "En Camino";
    } else {
      pedido.actualState = newState;
    }
    console.log(pedido)
    await pedido.save()
    
    res.send(pedido);
  };

//Elimina un pedido
const deleteOrder = async (req, res, next) => {
    const id = req.params.id;
    try {
      const resDel = await Order.deleteOne({ _id: id });
      res.json({ msg: "Deleted", resDel });
    } catch (error) {
      next(error);
    }

}

//modifica un envío por ID
const modifyOrder = async (req, res, next)=>{
    const id = req.params.id;
    try {
      const OrderUpdated = await Order.findByIdAndUpdate(id, req.body, {
        new: true,
      });

      res.json({ OrderUpdated });
    } catch (error) {
      next(error);
    }
}


module.exports = { allOrders, 
     newOrder,
     myorders,
     changingState, 
     noAssignedOrderList, 
     orderById, 
     deleteOrder, 
     orderByCourier, 
     modifyOrder, 
     allOrdersByState}