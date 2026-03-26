output "endpoint" { value = aws_db_instance.main.endpoint }
output "connection_string" {
  value     = "postgresql://${aws_db_instance.main.username}@${aws_db_instance.main.endpoint}/${aws_db_instance.main.db_name}"
  sensitive = true
}
