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
const HomePage = require('./models/HomePage');

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
        _id: req._id ? req._id : mongoose.Types.ObjectId(),
        parent: req.parent,
      });

      newCategory.save((err, saved) => {
        if (err) {
          callback(err);
        } else {
          callback(err, {
            statusCode: 200,
            headers: {
              "Access-Control-Allow-Origin": "*", // Required for CORS support to work
              "Access-Control-Allow-Credentials": true // Required for cookies, authorization headers with HTTPS
            },
            body: {category: saved}
          });
        }
      });
    })
};

module.exports.createAgencyRequest = (event, context, callback) => {
  context.callbackWaitsForEmptyEventLoop = false;

  connectToDatabase()
    .then(() => {
      let req = JSON.parse(event.body);

      let newRequest = new AgencyRequests({
        agency_name: req.agency_name,
        agency_email: req.agency_email,
        agency_url: req.agency_url,
        contact_name: req.contact_name,
        contact_phone: req.contact_phone,
        contact_email: req.contact_email,
        comments: req.comments,
        request_status: req.request_status,
        date_submitted: req.date_submitted,
        date_accepted: req.date_accepted,
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
      let req = JSON.parse(event.body);
      if (!req.agencyId || !req.countyName || req.pushCounty === null) {
        callback(null, { statusCode: 403, body: "Invalid request", headers: { "Content-Type": "text/plain" } });
      }

      Agency.findById(req.agencyId, (err, agency) => {
        if (err)
          callback(err);

        if (req.pushCounty) {
          agency.counties.addToSet(req.countyName);
        } else {
          agency.counties.pull(req.countyName);
        }

        agency.save((err, saved) => callback(err, {
          statusCode: 200,
          headers: {
            "Access-Control-Allow-Origin" : "*", // Required for CORS support to work
            "Access-Control-Allow-Credentials" : true // Required for cookies, authorization headers with HTTPS
          },
          body: { agency: saved }
        }));
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
          address: req.address,
          zipcode: req.zipcode,
          city: req.city,
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

module.exports.updateAgencyRequest = (event, context, callback) => {
  context.callbackWaitsForEmptyEventLoop = false;

  connectToDatabase()
    .then(() => {
      let req = JSON.parse(event.body);
      AgencyRequests.findOneAndUpdate(req.query,
		{ agency_name: req.agency_name,
			agency_email: req.agency_email,
			agency_url: req.agency_url,
			contact_name: req.contact_name,
			contact_phone: req.contact_phone,
			contact_email: req.contact_email,
			comments: req.comments,
			request_status: req.request_status,
			date_submitted: req.date_submitted,
			date_accepted: req.date_accepted
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

      if(!req.subcategories || !req.deletedSubcategories || !req.query || !req.name) {
        callback("Error");
      }

      req.deletedSubcategories.forEach((sub) => {
        Category.find({_id: sub._id}).remove().exec();
      });

      console.log(req.subcategories.toString());
      console.log(req.name);
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
        })
      );
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

module.exports.deleteAgencyRequest = (event, context, callback) => {
  context.callbackWaitsForEmptyEventLoop = false;

  connectToDatabase()
    .then(() => {
      let req = JSON.parse(event.body);
      AgencyRequests.remove({ _id: req.id }, (err, saved) => callback(err, {
        statusCode: 200,
        headers: {
          "Access-Control-Allow-Origin" : "*", // Required for CORS support to work
          "Access-Control-Allow-Credentials" : true // Required for cookies, authorization headers with HTTPS
        },
        body: {request: saved}
      }));
    })
};

module.exports.deleteCategory = (event, context, callback) => {
  context.callbackWaitsForEmptyEventLoop = false;

  connectToDatabase()
    .then(() => {
      let req = JSON.parse(event.body);

      Category.findOne({_id: req.parent._id})
        .exec((err, parent) => {
          console.log(parent.subcategories);
          parent.subcategories = parent.subcategories.filter(x => !x.equals(req.id));
          console.log(parent.subcategories);
          parent.save((err, saved) => {
            // Nothing
          });
        });


      console.log("inside delete category method");

      Category.findByIdAndRemove(req.id).exec((err, result) =>
        callback(err, {
          statusCode: 200,
          headers: {
            "Access-Control-Allow-Origin": "*", // Required for CORS support to work
            "Access-Control-Allow-Credentials": true // Required for cookies, authorization headers with HTTPS
          },
          body: {category: result}
        }));
    });
};

module.exports.getHomePageInfo = (event, context, callback) => {
    context.callbackWaitsForEmptyEventLoop = false;

    connectToDatabase()
        .then(() => {
            HomePage.findOne()
                .then(homePageInfo => callback(null, {
                    statusCode: 200,
                    headers: {
                        "Access-Control-Allow-Origin" : "*", // Required for CORS support to work
                        "Access-Control-Allow-Credentials" : true // Required for cookies, authorization headers with HTTPS
                    },
                    body: JSON.stringify(homePageInfo)
                }))
                .catch(err => callback(null, {
                    statusCode: err.statusCode || 500,
                    headers: { 'Content-Type': 'text/plain' },
                    body: 'Could not fetch the home page info.'
                }))
        });
};


module.exports.updateHomePage = (event, context, callback) => {
    context.callbackWaitsForEmptyEventLoop = false;

    connectToDatabase()
        .then(() => {
            let req = JSON.parse(event.body);

            if(!req.title || !req.description) {
                callback("Error");
            }

            console.log(req.title);
            console.log(req.description);
            // Update title and description
            HomePage.findOneAndUpdate({},{ title: req.title,
                    description: req.description,
                }, { upsert: true }, (err, saved) => callback(err, {
                    statusCode: 200,
                    headers: {
                        "Access-Control-Allow-Origin" : "*", // Required for CORS support to work
                        "Access-Control-Allow-Credentials" : true // Required for cookies, authorization headers with HTTPS
                    },
                    body: saved
                })
            );
        });
};