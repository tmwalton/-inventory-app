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
			var total_landed_value_in_stock = event.target.total_landed_value_in_stock.value;
			
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
			event.target.total_landed_value_in_stock.value = "";
		}
	});
	
	Template.table.events({
		"click .item": function() {
			var productId = this._id;
			Session.set('selectedProduct', productId);
			var selectedProduct = Session.get('selectedProduct');
			console.log(selectedProduct);
		},
		"keydown .quantity-field": function(event) {
			var newQuantity = event.target.value;
			console.log(newQuantity);
			var self = this;
			self.value = newQuantity;
			Items.update(this._id, {$set:{qtyInStock: newQuantity}});
			console.log('updated');
		}
	});
}

