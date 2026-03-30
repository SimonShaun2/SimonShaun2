module "vpc" {
  source      = "./modules/vpc"
  environment = var.environment
  aws_region  = var.aws_region
}

module "rds" {
  source          = "./modules/rds"
  environment     = var.environment
  vpc_id          = module.vpc.vpc_id
  subnet_ids      = module.vpc.private_subnet_ids
  instance_class  = var.db_instance_class
}

module "elasticache" {
  source     = "./modules/elasticache"
  environment = var.environment
  vpc_id      = module.vpc.vpc_id
  subnet_ids  = module.vpc.private_subnet_ids
  node_type   = var.redis_node_type
}

module "ecs" {
  source              = "./modules/ecs"
  environment         = var.environment
  vpc_id              = module.vpc.vpc_id
  public_subnets      = module.vpc.public_subnet_ids
  private_subnets     = module.vpc.private_subnet_ids
  api_cpu             = var.api_cpu
  api_memory          = var.api_memory
  api_desired_count   = var.api_desired_count
  database_url        = module.rds.connection_string
  redis_url           = module.elasticache.endpoint
  domain_name         = var.domain_name
  acm_certificate_arn = var.acm_certificate_arn
}
