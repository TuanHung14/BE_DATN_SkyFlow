const APIAggregate = async (
    model,
    payload,
    pipeline,
) => {
    const { limit, page } = payload;

    const isPipeline= [...pipeline];
    const countFilter = [...pipeline];

    if (page) isPipeline.push({ $skip: limit * (page - 1) });
    if (limit) isPipeline.push({ $limit: limit });

    const [aggregate, totalDocs] = await Promise.all([
        model.aggregate(isPipeline),
        model.aggregate(countFilter),
    ]);

    return {
        status: "success",
        totalDocs: totalDocs.length,
        totalPages: Math.ceil(totalDocs.length / limit),
        page,
        limit,
        data: {
            data: aggregate,
        },
    };
};


module.exports = APIAggregate;