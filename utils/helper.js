const { Action, Resource } = require("../model/permissionModel");

exports.filterObj = (obj, ...allowedFields) => {
    const newObj = {};
    Object.keys(obj).forEach(el => {
        if(allowedFields.includes(el)) newObj[el] = obj[el];
    })
    return newObj;
};

exports.getRBACOnResorce = (resource) => {
    const arrayResource = Object.keys(Resource);
    if(!arrayResource.includes(resource)){
        return {};
    }
    const rbacPermission = new Object();
    for (const [actionKey, actionValue] of Object.entries(Action)){
        rbacPermission[`rbac_${actionValue}`] = `${actionValue}_${Resource[resource]}`
    }
    return rbacPermission;
}
