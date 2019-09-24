export const getRoute = (req) => {
    return process.env.APP_URL + req.route.path;
}