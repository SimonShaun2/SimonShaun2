output "vpc_id" {
  value = module.vpc.vpc_id
}

output "rds_endpoint" {
  value     = module.rds.endpoint
  sensitive = true
}

output "redis_endpoint" {
  value = module.elasticache.endpoint
}

output "alb_dns" {
  value = module.ecs.alb_dns
}

output "ecs_cluster_name" {
  value = module.ecs.cluster_name
}
