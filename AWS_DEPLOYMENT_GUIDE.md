# AWS Deployment Guide for Xtracover BBG Application

## Recommended AWS Architecture

### **Core Infrastructure**

#### **1. Compute - EC2 Instances**
**Recommended Instance Types:**

**Production Environment:**
- **Primary**: `t3.medium` (2 vCPUs, 4GB RAM)
  - Cost: ~$30-35/month per instance
  - Perfect for Node.js applications with moderate traffic
  - Burstable performance for traffic spikes
  - Cost-effective for BBG application workload

**High Traffic/Enterprise:**
- **Upgrade**: `c5.xlarge` (4 vCPUs, 8GB RAM) 
  - Cost: ~$120-140/month per instance
  - Consistent high performance
  - Better for sustained high loads

**Development/Staging:**
- **Cost-Effective**: `t3.small` (2 vCPUs, 2GB RAM)
  - Cost: ~$15-20/month
  - Sufficient for development and testing

#### **2. Auto Scaling Configuration**
```yaml
Auto Scaling Group:
  - Minimum Instances: 2
  - Desired Capacity: 2  
  - Maximum Instances: 6
  - Target CPU Utilization: 70%
  - Scale-out: +1 instance when CPU > 70% for 5 minutes
  - Scale-in: -1 instance when CPU < 30% for 15 minutes
```

#### **3. Load Balancing**
- **Application Load Balancer (ALB)**
  - Cost: ~$20-25/month
  - SSL termination
  - Health checks
  - Path-based routing for admin panel

### **Database Strategy**

#### **Option 1: Keep External SQL Server (Recommended)**
- **Current Setup**: Microsoft SQL Server (103.205.66.184:2499)
- **Pros**: No migration needed, already optimized
- **Security**: VPC peering or VPN connection for secure access
- **Cost**: $0 additional (existing)

#### **Option 2: Migrate to RDS SQL Server**
- **Instance**: `db.t3.medium` (2 vCPUs, 4GB RAM)
- **Cost**: ~$180-220/month
- **Storage**: 100GB SSD (~$12/month)
- **Benefits**: AWS-managed, automated backups, Multi-AZ

### **Storage & CDN**

#### **File Storage - S3**
- **Current**: Already configured with AWS S3
- **Optimization**: 
  - CloudFront CDN for file delivery
  - S3 Intelligent Tiering for cost optimization
  - Cost: ~$10-30/month depending on usage

### **Networking**

#### **VPC Configuration**
```
VPC: 10.0.0.0/16
├── Public Subnets (ALB): 10.0.1.0/24, 10.0.2.0/24
├── Private Subnets (EC2): 10.0.10.0/24, 10.0.11.0/24
└── Database Subnets: 10.0.20.0/24, 10.0.21.0/24
```

#### **Security Groups**
- **ALB Security Group**: HTTP(80), HTTPS(443) from 0.0.0.0/0
- **EC2 Security Group**: Port 5000 from ALB only
- **Database Security Group**: Port 1433 from EC2 only

### **Monitoring & Logging**

#### **CloudWatch Configuration**
- **Metrics**: CPU, Memory, Network, Custom App metrics
- **Alarms**: High CPU, Low disk space, Application errors
- **Logs**: Application logs, Access logs, Error logs
- **Cost**: ~$10-20/month

#### **Application Performance**
- **AWS X-Ray**: Request tracing
- **CloudWatch Insights**: Log analysis
- **Custom Dashboards**: Business metrics

### **CI/CD Pipeline**

#### **CodePipeline Setup**
```yaml
Source: GitHub Repository
Build: CodeBuild
  - Node.js 18
  - npm install
  - npm run build
  - Create deployment package
Deploy: CodeDeploy
  - Blue/Green deployment
  - Automatic rollback on failure
```

### **SSL & Domain**

#### **Certificate & DNS**
- **Route 53**: DNS management (~$0.50/month per hosted zone)
- **ACM Certificate**: Free SSL certificate
- **Domain**: Your existing domain or new .com

### **Estimated Monthly Costs**

#### **Production Setup (Medium Traffic)**
```
EC2 Instances (2x t3.medium):       $70
Application Load Balancer:           $25
CloudWatch & Monitoring:             $15
S3 & CloudFront:                     $20
Route 53:                            $5
CodePipeline (if used):              $10
NAT Gateway:                         $45
Data Transfer:                       $20
─────────────────────────────────────
Total Estimated:                    $210/month
```

#### **High Performance Setup**
```
EC2 Instances (2x c5.xlarge):        $280
RDS SQL Server (db.t3.medium):       $200
Other services (same as above):      $140
─────────────────────────────────────
Total Estimated:                    $620/month
```

### **Deployment Steps**

#### **Phase 1: Infrastructure Setup**
1. Create VPC and subnets
2. Set up security groups
3. Launch EC2 instances with Auto Scaling
4. Configure Application Load Balancer
5. Set up Route 53 and SSL certificate

#### **Phase 2: Application Deployment**
1. Install Node.js and dependencies on EC2
2. Configure environment variables
3. Set up PM2 for process management
4. Configure nginx as reverse proxy
5. Deploy application code

#### **Phase 3: Database & Services**
1. Configure external SQL Server connectivity
2. Test all API integrations (PayU, Kaleyra, Gupshup)
3. Verify S3 file uploads
4. Test email functionality (AWS SES)

#### **Phase 4: Monitoring & Optimization**
1. Set up CloudWatch dashboards
2. Configure alarms and notifications
3. Test auto-scaling policies
4. Performance optimization

### **Security Considerations**

#### **Best Practices**
- **WAF**: Web Application Firewall for DDoS protection
- **Secrets Manager**: Store API keys and database credentials
- **IAM Roles**: Least privilege access
- **VPC Flow Logs**: Network traffic monitoring
- **GuardDuty**: Threat detection

### **Migration Timeline**

#### **Estimated Timeline: 2-3 weeks**
- **Week 1**: Infrastructure setup and basic deployment
- **Week 2**: Application configuration and testing
- **Week 3**: Performance tuning and go-live

### **Backup & Disaster Recovery**

#### **Data Protection**
- **EC2 Snapshots**: Daily automated snapshots
- **Database Backups**: External SQL Server backup strategy
- **S3 Cross-Region Replication**: For file storage
- **Multi-AZ Deployment**: High availability

### **Performance Optimization**

#### **Application Level**
- **Node.js Clustering**: Utilize all CPU cores
- **Redis ElastiCache**: Session storage and caching
- **CloudFront**: Static asset delivery
- **Gzip Compression**: Reduce bandwidth usage

Would you like me to proceed with creating the deployment scripts and infrastructure-as-code templates for this AWS setup?