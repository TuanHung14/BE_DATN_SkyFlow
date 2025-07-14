const { Action, Resource } = require("../model/permissionModel");

exports.filterObj = (obj, ...allowedFields) => {
    const newObj = {};
    Object.keys(obj).forEach(el => {
        if(allowedFields.includes(el)) newObj[el] = obj[el];
    })
    return newObj;
};

exports.getRBACOnResorce = (resource) => {
    const rbacPermission = new Object();
    for (const [actionKey, actionValue] of Object.entries(Action)){
        rbacPermission[`${actionValue}`] = `${actionValue}_${resource}`
    }
    return rbacPermission;
}
