Items = new Mongo.Collection("items");

Router.route('/inventory');

Router.route('/', function() {
	this.render('login');
});

if (Meteor.isServer) {
	var fs = Npm.require('fs');
	var path =

	Meteor.startup(function() {
		return Meteor.methods({
			removeAllItems: function() {
				return Items.remove({});
			},
			saveFile: function() {
				 var data = Items.find({}, {fields: {'createdAt':0, '_id':0}}).fetch();
				 var csvData = "Product, SKU#, Raw Cost, Landed Cost, Qty In Stock, Total Landed Value In Stock \n" + json2csv(data);
				 // Write the file to the server here
				 fs.writeFile("new_inventory.csv", csvData, function (error) {
					 if (error) {
						 return console.log("error");
					 }
					 console.log("File was saved");
				 });
			}
		});
	});
}


if (Meteor.isClient) {

	Router.onBeforeAction(function() {
		if(!Meteor.userId()) {
			this.render('login');
		} else {
			this.render('inventory');
		}
	});


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
			var total_landed_value_in_stock = (qty_in_stock * landed_cost).toFixed(2);

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

			Meteor.call('saveFile');
		}
	});

	Template.table.events({
		"click .item": function() {
			var productId = this._id;
			Session.set('selectedProduct', productId);
			var selectedProduct = Session.get('selectedProduct');
		},
		"click .remove-product": function() {
			var productId = this._id;
			var remove = confirm("delete this product?"); // Switch to bootstrap confirmation popup later
			if (remove == true) {
			Items.remove(productId);
			Meteor.call('saveFile');
			};
		},

		"keydown .quantity-field": function(event) {

			var productId = this._id;
			Session.set('selectedProduct', productId);
			var cost = Items.findOne({'_id':this._id}, {'landedCost': 1}).landedCost;

			if (event.keyCode == 13) {
				var newQuantity = event.target.value;
				var self = this;
				self.value = newQuantity;

				var newValue = (cost * newQuantity).toFixed(2);

				Items.update(this._id, {$set:{qtyInStock: newQuantity}});
				Items.update(this._id, {$set:{totalLandedValueInStock: newValue}});
				Meteor.call('saveFile');
				console.log('updated');
			}
		}
	});

	Template.export_csv.events({
		"click .export-csv": function() {
			var data = Items.find({}, {fields: {'createdAt':0, '_id':0}}).fetch();
			var csvData = "Product, SKU#, Raw Cost, Landed Cost, Qty In Stock, Total Landed Value In Stock \n" + json2csv(data);
			var blob = new Blob([csvData], {type: "text/csv;charset=utf-8"});
			saveAs(blob, "inventory.csv");
		}
	});

	Template.inventory.events({
		"click .logout": function() {
			Meteor.logout();
		}
	});
}
