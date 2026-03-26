resource "aws_db_subnet_group" "main" {
  name       = "trayloop-${var.environment}"
  subnet_ids = var.subnet_ids
}

resource "aws_security_group" "rds" {
  name_prefix = "trayloop-${var.environment}-rds-"
  vpc_id      = var.vpc_id

  ingress {
    from_port   = 5432
    to_port     = 5432
    protocol    = "tcp"
    cidr_blocks = ["10.0.0.0/16"]
  }
}

resource "aws_db_instance" "main" {
  identifier           = "trayloop-${var.environment}"
  engine               = "postgres"
  engine_version       = "16"
  instance_class       = var.instance_class
  allocated_storage    = 20
  max_allocated_storage = 100
  db_name              = "trayloop"
  username             = "trayloop_admin"
  manage_master_user_password = true
  multi_az             = var.environment == "production"
  db_subnet_group_name = aws_db_subnet_group.main.name
  vpc_security_group_ids = [aws_security_group.rds.id]
  skip_final_snapshot  = var.environment != "production"
  backup_retention_period = var.environment == "production" ? 7 : 1
  storage_encrypted    = true
}
