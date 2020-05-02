var keystone = require('keystone');
var Types = keystone.Field.Types;

/**
 * Covid19 Model
 * ==========
 */
var Covid19 = new keystone.List('Covid19');

Covid19.add({
	name: { type: Types.Name, required: true, index: true },
	email: { type: Types.Email, initial: true, required: true, unique: true, index: true },
	password: { type: Types.Password, initial: true, required: true },
}, 'Permissions', {
	isAdmin: { type: Boolean, label: 'Can access Keystone', index: true },
});

// Provide access to Keystone
Covid19.schema.virtual('canAccessKeystone').get(function () {
	return this.isAdmin;
});


/**
 * Relationships
 */
Covid19.relationship({ ref: 'Post', path: 'posts', refPath: 'author' });


/**
 * Registration
 */
Covid19.defaultColumns = 'name, email, isAdmin';
Covid19.register();
