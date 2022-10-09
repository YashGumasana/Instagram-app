import { UnauthorizedError } from "../errors/index.js";

const checkPermissions = (requestUser, resourceUserId) => {

    console.log(';;');
    // console.log(requestUser.role);
    // console.log(requestUser.userId);
    // console.log(resourceUserId.toString());
    // console.log('...');
    if (requestUser.role === 'admin') return;
    // console.log('*/*/');
    if (requestUser.userId === resourceUserId.toString()) return;
    // console.log('****');
    throw new UnauthorizedError('Not authorized to access this route');
};

export default checkPermissions;