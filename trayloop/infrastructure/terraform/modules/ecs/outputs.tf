output "cluster_name" { value = aws_ecs_cluster.main.name }
output "alb_dns" { value = aws_lb.main.dns_name }
output "api_service_name" { value = aws_ecs_service.api.name }
