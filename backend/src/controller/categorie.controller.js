const prisma=require("../config/prisma");

exports.getAllCategories=async (req,res)=>{
    try{
        const categories = await prisma.categorie.findMany({
            orderBy:{code:"asc"}
        });
        res.json(categories);
    }catch(error){
        res.status(500).json({error:error.message});
    }
};

exports.getCategoryById =async(req,res)=>{
    try{
        const id=parseInt(req.params.id);
        const category =await prisma.categorie.findUnique({
            where:{id}
        });
        if(!category){
            return res.status(404).json({message:"catégorie non trouvée"});
        }
        res.json(category);
    }catch(error){
        res.status(500).json({error:error.message});
    }
    
};