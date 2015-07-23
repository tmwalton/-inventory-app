Items = new Mongo.Collection("items");

if (Meteor.isServer) {
	Meteor.startup(function() {
		return Meteor.methods({
			removeAllItems: function() {
				return Items.remove({});
			}
		});
	});
}

if (Meteor.isClient) {
	
	Template.table.helpers({
		items: function() {
			return Items.find({});
		}
	});
	
	Template.new_product.events({
		
		"submit form": function (event, template) {
			// Prevent default browser form submit
			event.preventDefault();
			
			var product = event.target.product.value;
			var sku = event.target.sku.value;
			var raw_cost = event.target.raw_cost.value;
			var landed_cost = event.target.landed_cost.value;
			var qty_in_stock = event.target.qty_in_stock.value;
			var total_landed_value_in_stock = qty_in_stock * landed_cost;
			
			Items.insert({
				product: product,
				sku: sku,
				rawCost: raw_cost,
				landedCost: landed_cost,
				qtyInStock: qty_in_stock,
				totalLandedValueInStock: total_landed_value_in_stock,
				createdAt: new Date()
			});
			
			event.target.product.value = "";
			event.target.sku.value = "";
			event.target.raw_cost.value = "";
			event.target.landed_cost.value = "";
			event.target.qty_in_stock.value = "";
		}
	});
	
	Template.table.events({
		"click .item": function() {
			var productId = this._id;
			Session.set('selectedProduct', productId);
			var selectedProduct = Session.get('selectedProduct');
		},
		
		"keydown .quantity-field": function(event) {
			
			var productId = this._id;
			Session.set('selectedProduct', productId);
			//var cost = Items.find({"_id": this._id}, {fields: {'landedCost':1, '_id':0}}).fetch();
			var cost = Items.findOne({'_id':this._id}, {'landedCost': 1}).landedCost;
			
			if (event.keyCode == 13) {
				var newQuantity = event.target.value;
				var self = this;
				self.value = newQuantity;
				
				var newValue = "$" + cost * newQuantity + ".00"; // Move currency formatting logic to onRendered
				
				Items.update(this._id, {$set:{qtyInStock: newQuantity}});
				Items.update(this._id, {$set:{totalLandedValueInStock: newValue}});
				console.log('updated');
			}
		}
	});
	
	Template.table.onRendered({
		// Create function to format table cells for currency on rendering so 
		// as not to pollute data
	});
}

