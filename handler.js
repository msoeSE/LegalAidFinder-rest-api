'use strict';
require('dotenv').config({ path: './variables.env' });
const connectToDatabase = require('./db');
const mongoose = require('mongoose');
const Admin = require('./models/Admin');
const Agency = require('./models/Agency');
const Category = require('./models/Category');
const County = require('./models/County');
const Eligibility = require('./models/Eligibility');
const AgencyRequests = require('./models/AgencyRequests');
const EligibilityType = require('./models/EligibilityType');

module.exports.createEligibilityType = (event, context, callback) => {
  context.callbackWaitsForEmptyEventLoop = false;

  connectToDatabase()
    .then(() => {
      let req = JSON.parse(event.body);
      if (!req.name || !req.comparators || !req.valueType) {
        callback(null, { statusCode: 403, body: "Invalid request", headers: { "Content-Type": "text/plain" } });
      }

      let newEligibilityType = new EligibilityType({
        name: req.name,
        comparators: req.comparators,
        valueType: req.valueType,
        _id: mongoose.Types.ObjectId()
      });

      newEligibilityType.save((err, saved) => callback(err, {
        statusCode: 200,
        headers: {
          "Access-Control-Allow-Origin" : "*", // Required for CORS support to work
          "Access-Control-Allow-Credentials" : true // Required for cookies, authorization headers with HTTPS
        },
        body: {eligibilityType: saved}
      }));
    });
};

module.exports.addAgencyToCategory = (event, context, callback) => {
  context.callbackWaitsForEmptyEventLoop = false;

  connectToDatabase()
    .then(() => {
      let req = JSON.parse(event.body);
      if (!req.categoryId || !req.agencyId || req.pushAgency === null) {
        callback(null, { statusCode: 403, body: "Invalid request", headers: { "Content-Type": "text/plain" } });
      }

      Category.findById(req.categoryId, (err, category) => {
        if (err)
          callback(err);

        if (req.pushAgency) {
          category.agencies.addToSet(req.agencyId);
        } else {
          category.agencies.pull(req.agencyId);
        }

        category.save((err, saved) => callback(err, {
          statusCode: 200,
          headers: {
            "Access-Control-Allow-Origin" : "*", // Required for CORS support to work
            "Access-Control-Allow-Credentials" : true // Required for cookies, authorization headers with HTTPS
          },
          body: {category: saved}
        }));
      });
    });
};

module.exports.createAgency = (event, context, callback) => {
  context.callbackWaitsForEmptyEventLoop = false;

  connectToDatabase()
    .then(() => {
      let req = JSON.parse(event.body);
      var email_array = []
      req.emails.forEach((email) => {
        email_array.push(email.address);
      });

      var newAgency = new Agency({
        name: req.name,
        url: req.url,
        emails: email_array,
        _id: mongoose.Types.ObjectId()
      });

      newAgency.save((err, saved) => callback(err, {
        statusCode: 200,
        headers: {
          "Access-Control-Allow-Origin" : "*", // Required for CORS support to work
          "Access-Control-Allow-Credentials" : true // Required for cookies, authorization headers with HTTPS
        },
        body: {agency: saved}
      }));      
    })
};

module.exports.createCategory = (event, context, callback) => {
  context.callbackWaitsForEmptyEventLoop = false;

  connectToDatabase()
    .then(() => {
      let req = JSON.parse(event.body);
      var newCategory = new Category({
        name: req.name,
        _id: mongoose.Types.ObjectId(),
        parent: req.parent,
      });

      newCategory.save((err, saved) => {
        if (err) {
          callback(err);
        } else {
          let subs = req.parent.subcategories;
          subs.push(saved);
          Category.findOneAndUpdate({ _id: req.parent._id },
          {
            name: req.parent.name,
            subcategories: subs
          }, {upsert:true}, (err, saved) => callback(err, {
            statusCode: 200,
            headers: {
              "Access-Control-Allow-Origin" : "*", // Required for CORS support to work
              "Access-Control-Allow-Credentials" : true // Required for cookies, authorization headers with HTTPS
            },
            body: {category: saved}
          })
        )}
      });
    })
};

module.exports.createAgencyRequest = (event, context, callback) => {
  context.callbackWaitsForEmptyEventLoop = false;

  connectToDatabase()
    .then(() => {
      let req = JSON.parse(event.body);

      var newRequest = new AgencyRequests({
        agency_name: req.agency_name,
		agency_email: req.agency_email,
		agency_url: req.agency_url,
		contact_name: req.contact_name,
		contact_phone: req.contact_phone,
		contact_email: req.contact_email,
		comments: req.comments,
        _id: mongoose.Types.ObjectId()
      });

      newRequest.save((err, saved) => callback(err, {
        statusCode: 200,
        headers: {
          "Access-Control-Allow-Origin" : "*", // Required for CORS support to work
          "Access-Control-Allow-Credentials" : true // Required for cookies, authorization headers with HTTPS
        },
        body: {request: saved}
      }));      
    })
};

module.exports.createEligibility = (event, context, callback) => {
  context.callbackWaitsForEmptyEventLoop = false;

  connectToDatabase()
    .then(() => {
      let req = JSON.parse(event.body);
      if (!req.agencyId || !req.categoryId || !req.data || req.data.length === 0) {
        callback(null, { statusCode: 403, body: "Invalid request", headers: { "Content-Type": "text/plain" } });
      }

      Eligibility.findOne({ agency: req.agencyId, category: req.categoryId })
        .exec((err, elig) => {
          if (err) {
            callback(err);
          } else {
            if (elig === null) {
              const newEligibility = new Eligibility({
                _id: new mongoose.Types.ObjectId(),
                agency: req.agencyId,
                category: req.categoryId,
                key_comparator_value: req.data,
              });

              newEligibility.save((error) => callback(error, {
                statusCode: 200,
                headers: {
                  "Access-Control-Allow-Origin" : "*", // Required for CORS support to work
                  "Access-Control-Allow-Credentials" : true // Required for cookies, authorization headers with HTTPS
                },
                body: {eligibilities: newEligibility}
              }));
            } else {
              elig.key_comparator_value = req.data;

              elig.save((error, e) => callback(error, {
                  statusCode: 200,
                  headers: {
                    "Access-Control-Allow-Origin" : "*", // Required for CORS support to work
                    "Access-Control-Allow-Credentials" : true // Required for cookies, authorization headers with HTTPS
                  },
                  body: {eligibilities: e}
                })
              );
            }
          }
        }
      );
})};

module.exports.getAllAdmin = (event, context, callback) => {
  context.callbackWaitsForEmptyEventLoop = false;

  connectToDatabase()
    .then(() => {
      Admin.find()
        .then(admins => callback(null, {
          statusCode: 200,
          headers: {
            "Access-Control-Allow-Origin" : "*", // Required for CORS support to work
            "Access-Control-Allow-Credentials" : true // Required for cookies, authorization headers with HTTPS
          },
          body: JSON.stringify(admins)
        }))
        .catch(err => callback(null, {
          statusCode: err.statusCode || 500,
          headers: { 'Content-Type': 'text/plain' },
          body: 'Could not fetch the notes.'
        }))
    });
};

module.exports.deleteEligibilityType = (event, context, callback) => {
  context.callbackWaitsForEmptyEventLoop = false;

  connectToDatabase()
    .then(() => {
      let req = JSON.parse(event.body);

      EligibilityType.remove({ _id: req.id }, (err, saved) => callback(err, {
        statusCode: 200,
        headers: {
          "Access-Control-Allow-Origin" : "*", // Required for CORS support to work
          "Access-Control-Allow-Credentials" : true // Required for cookies, authorization headers with HTTPS
        },
        body: {_id: req.id}
      }));
    })
};

module.exports.getAllEligibilityType = (event, context, callback) => {
  context.callbackWaitsForEmptyEventLoop = false;

  connectToDatabase()
    .then(() => {
      EligibilityType.find()
        .then(eligibilityType => callback(null, {
          statusCode: 200,
          headers: {
            "Access-Control-Allow-Origin" : "*", // Required for CORS support to work
            "Access-Control-Allow-Credentials" : true // Required for cookies, authorization headers with HTTPS
          },
          body: JSON.stringify(eligibilityType)
        }))
        .catch(err => callback(null, {
          statusCode: err.statusCode || 500,
          headers: { 'Content-Type': 'text/plain' },
          body: 'Could not fetch the notes.'
        }))
    });
};

module.exports.addCountyToAgency = (event, context, callback) => {
  context.callbackWaitsForEmptyEventLoop = false;

  connectToDatabase()
    .then(() => {
      Agency.findOneAndUpdate(req.query,
        { 
          counties: req.counties
        }, {upsert:true}, (err, saved) => {
          if (err) {
            callback(err);
          } else {
            callback(null, {
            statusCode: 200,
            headers: {
              "Access-Control-Allow-Origin" : "*", // Required for CORS support to work
              "Access-Control-Allow-Credentials" : true // Required for cookies, authorization headers with HTTPS
            },
            body: {agency: req.body}
          })
        }
      });
    });
};

module.exports.getAllAgency = (event, context, callback) => {
  context.callbackWaitsForEmptyEventLoop = false;

  connectToDatabase()
    .then(() => {
      Agency.find()
        .populate('agencies')
        .then(agencies => callback(null, {
          statusCode: 200,
          headers: {
            "Access-Control-Allow-Origin" : "*", // Required for CORS support to work
            "Access-Control-Allow-Credentials" : true // Required for cookies, authorization headers with HTTPS
          },
          body: JSON.stringify(agencies)
        }))
        .catch(err => callback(null, {
          statusCode: err.statusCode || 500,
          headers: { 'Content-Type': 'text/plain' },
          body: 'Could not fetch the notes.'
        }))
    });
};

module.exports.getAllAgencyRequests = (event, context, callback) => {
  context.callbackWaitsForEmptyEventLoop = false;

  connectToDatabase()
    .then(() => {
      AgencyRequests.find()
        .then(requests => callback(null, {
          statusCode: 200,
          headers: {
            "Access-Control-Allow-Origin" : "*", // Required for CORS support to work
            "Access-Control-Allow-Credentials" : true // Required for cookies, authorization headers with HTTPS
          },
          body: JSON.stringify(requests)
        }))
        .catch(err => callback(null, {
          statusCode: err.statusCode || 500,
          headers: { 'Content-Type': 'text/plain' },
          body: 'Could not fetch the notes.'
        }))
    });
};

module.exports.getAllCategory = (event, context, callback) => {
  context.callbackWaitsForEmptyEventLoop = false;
  
  connectToDatabase()
    .then(() => {
      Category.find()
        .populate({
          path: 'subcategories',
          // Populate categories in subcategories
          populate: { path: 'subcategories agencies' },
        })
        .populate({
          path: 'parent',
          // Populate parents in subcategories
          populate: { path: 'parent' },
        })
        .populate({
          path: 'agencies',
          // Populate parents in subcategories
          populate: { path: 'agencies' },
        })
        .then(categories => callback(null, {
          statusCode: 200,
          headers: {
            "Access-Control-Allow-Origin" : "*", // Required for CORS support to work
            "Access-Control-Allow-Credentials" : true // Required for cookies, authorization headers with HTTPS
          },
          body: JSON.stringify(categories)
        }))
        .catch(err => callback(null, {
          statusCode: err.statusCode || 500,
          headers: { 'Content-Type': 'text/plain' },
          body: 'Could not fetch categories from handler.getAllCategory().'
        }))
    });
};

module.exports.getAllCounty = (event, context, callback) => {
  context.callbackWaitsForEmptyEventLoop = false;

  connectToDatabase()
    .then(() => {
      County.find()
        .then(counties => callback(null, {
          statusCode: 200,
          headers: {
            "Access-Control-Allow-Origin" : "*", // Required for CORS support to work
            "Access-Control-Allow-Credentials" : true // Required for cookies, authorization headers with HTTPS
          },
          body: JSON.stringify(counties)
        }))
        .catch(err => callback(null, {
          statusCode: err.statusCode || 500,
          headers: { 'Content-Type': 'text/plain' },
          body: 'Could not fetch the notes.'
        }))
    });
};

module.exports.getAllEligibility = (event, context, callback) => {
  context.callbackWaitsForEmptyEventLoop = false;

  connectToDatabase()
    .then(() => {
      Eligibility.find()
        .then(eligibilities => callback(null, {
          statusCode: 200,
          headers: {
            "Access-Control-Allow-Origin" : "*", // Required for CORS support to work
            "Access-Control-Allow-Credentials" : true // Required for cookies, authorization headers with HTTPS
          },
          body: JSON.stringify(eligibilities)
        }))
        .catch(err => callback(null, {
          statusCode: err.statusCode || 500,
          headers: { 'Content-Type': 'text/plain' },
          body: 'Could not fetch the notes.'
        }))
    });
};

module.exports.updateAgency = (event, context, callback) => {
  context.callbackWaitsForEmptyEventLoop = false;

  connectToDatabase()
    .then(() => {
      let req = JSON.parse(event.body);
      let email_array = [];
      req.emails.forEach((email) => {
        email_array.push(email.address);
      });
      Agency.findOneAndUpdate(req.query,
        { name: req.name,
          url: req.url,
          emails: email_array,
          phone: req.phone,
          operation: req.operation,
        }, {upsert:true}, (err, saved) => {
            callback(err, {
            statusCode: 200,
            headers: {
              "Access-Control-Allow-Origin" : "*", // Required for CORS support to work
              "Access-Control-Allow-Credentials" : true // Required for cookies, authorization headers with HTTPS
            },
            body: {agency: saved}
          })
        });
    });
};

module.exports.updateCategory = (event, context, callback) => {
  context.callbackWaitsForEmptyEventLoop = false;

  connectToDatabase()
    .then(() => {
      let req = JSON.parse(event.body);
      req.subcategories.forEach((sub) => {
        // Update new parent for subcategory
        Category.findOneAndUpdate({ _id: sub._id },
          {
            name: sub.name,
            parent: sub.new_parent,
          });
        // Remove from parent subcategory array
        Category.findOneAndUpdate({ _id: sub.parent._id },
          {
            name: sub.parent.name,
            subcategories: sub.parent.subcategories,
          }, { upsert: true });
      });
    // Update subcategories and name for selected category
    Category.findOneAndUpdate(req.query,
      { name: req.name,
        subcategories: req.subcategories,
      }, { upsert: true }, (err, saved) => callback(err, {
        statusCode: 200,
        headers: {
          "Access-Control-Allow-Origin" : "*", // Required for CORS support to work
          "Access-Control-Allow-Credentials" : true // Required for cookies, authorization headers with HTTPS
        },
        body: saved
      }));
    });
};

module.exports.deleteAgency = (event, context, callback) => {
  context.callbackWaitsForEmptyEventLoop = false;

  connectToDatabase()
    .then(() => {
      let req = JSON.parse(event.body);
      Agency.remove({ _id: req.id }, (err, saved) => callback(err, {
        statusCode: 200,
        headers: {
          "Access-Control-Allow-Origin" : "*", // Required for CORS support to work
          "Access-Control-Allow-Credentials" : true // Required for cookies, authorization headers with HTTPS
        },
        body: {agency: saved}
      }));
    })
};

module.exports.deleteCategory = (event, context, callback) => {
  context.callbackWaitsForEmptyEventLoop = false;

  connectToDatabase()
    .then(() => {
      let req = JSON.parse(event.body);
      Category.remove({ _id: req.id }, (err, saved) => callback(err, {
        statusCode: 200,
        headers: {
          "Access-Control-Allow-Origin" : "*", // Required for CORS support to work
          "Access-Control-Allow-Credentials" : true // Required for cookies, authorization headers with HTTPS
        },
        body: {agency: saved}
      }));
    })
};
