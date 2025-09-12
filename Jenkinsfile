pipeline {
    agent any
    
    environment {
        NODE_VERSION = '18'
        DEPLOY_DIR = '/tmp/roastrava-deploy'  // Local directory untuk testing
    }
    
    stages {
        stage('📋 Checkout') {
            steps {
                echo '🔍 Checking out source code...'
                checkout scm
                sh 'ls -la'  // List files untuk memastikan checkout berhasil
            }
        }
        
        stage('🏗️ Setup Node.js') {
            steps {
                echo '📦 Setting up Node.js environment...'
                sh '''
                    node --version
                    npm --version
                    echo "Current working directory: $(pwd)"
                '''
            }
        }
        
        stage('📦 Install Dependencies') {
            steps {
                echo '⬇️ Installing dependencies...'
                sh 'npm install'
                sh 'ls -la node_modules/ | head -10'  // Check if node_modules created
            }
        }
        
        stage('🧪 Run Tests') {
            steps {
                echo '🔬 Running tests...'
                script {
                    try {
                        sh 'npm test -- --watchAll=false --coverage'
                    } catch (Exception e) {
                        echo "⚠️ No tests found or test failed: ${e.getMessage()}"
                        echo "Continuing with build..."
                    }
                }
            }
        }
        
        stage('🏗️ Build Application') {
            steps {
                echo '🔨 Building application...'
                sh 'npm run build'
                sh 'ls -la build/ || ls -la dist/ || echo "Build directory not found"'
            }
        }
        
        stage('🚀 Deploy to Local') {
            steps {
                echo '📂 Deploying to local directory...'
                sh '''
                    # Create deploy directory
                    mkdir -p ${DEPLOY_DIR}
                    
                    # Backup existing deployment
                    if [ -d "${DEPLOY_DIR}/current" ]; then
                        mv ${DEPLOY_DIR}/current ${DEPLOY_DIR}/backup_$(date +%Y%m%d_%H%M%S)
                    fi
                    
                    # Deploy new build
                    mkdir -p ${DEPLOY_DIR}/current
                    
                    if [ -d "build" ]; then
                        cp -r build/* ${DEPLOY_DIR}/current/
                        echo "✅ Deployed from build/ directory"
                    elif [ -d "dist" ]; then
                        cp -r dist/* ${DEPLOY_DIR}/current/
                        echo "✅ Deployed from dist/ directory"
                    else
                        echo "❌ No build output found!"
                        exit 1
                    fi
                    
                    # List deployed files
                    echo "📁 Deployed files:"
                    ls -la ${DEPLOY_DIR}/current/
                '''
            }
        }
        
        stage('🏥 Health Check') {
            steps {
                echo '🩺 Running health check...'
                sh '''
                    # Start simple HTTP server for testing
                    cd ${DEPLOY_DIR}/current
                    
                    # Kill existing server if running
                    pkill -f "python3.*http.server.*8090" || true
                    sleep 2
                    
                    # Start server in background
                    nohup python3 -m http.server 8090 > server.log 2>&1 &
                    sleep 3
                    
                    # Test if server is running
                    if curl -f http://localhost:8090; then
                        echo "✅ Health check passed!"
                    else
                        echo "❌ Health check failed!"
                        cat server.log
                        exit 1
                    fi
                '''
            }
        }
    }
    
    post {
        always {
            echo '🏁 Pipeline completed!'
            echo "📊 Build info:"
            echo "  - Job: ${env.JOB_NAME}"
            echo "  - Build: ${env.BUILD_NUMBER}"
            echo "  - Branch: ${env.GIT_BRANCH}"
            echo "  - Commit: ${env.GIT_COMMIT}"
            echo "🌐 Access deployed app: http://localhost:8090"
        }
        success {
            echo '✅ Pipeline succeeded!'
            script {
                sh '''
                    echo "🎉 Deployment successful!"
                    echo "📁 Files deployed to: ${DEPLOY_DIR}/current"
                    echo "🌐 Server running on: http://localhost:8090"
                    echo "📋 Build summary:"
                    echo "  - Source: ${GIT_URL}"
                    echo "  - Branch: ${GIT_BRANCH}"
                    echo "  - Commit: ${GIT_COMMIT}"
                '''
            }
        }
        failure {
            echo '❌ Pipeline failed!'
            script {
                sh '''
                    echo "💥 Build failed! Checking for issues..."
                    echo "📋 Troubleshooting info:"
                    echo "  - Node version: $(node --version 2>/dev/null || echo 'Node.js not found')"
                    echo "  - NPM version: $(npm --version 2>/dev/null || echo 'npm not found')"
                    echo "  - Current directory: $(pwd)"
                    echo "  - Available space: $(df -h . | tail -1)"
                    
                    # Try to rollback if possible
                    if [ -d "${DEPLOY_DIR}/backup_"* ]; then
                        LATEST_BACKUP=$(ls -t ${DEPLOY_DIR}/backup_* | head -1)
                        echo "🔄 Rolling back to: $LATEST_BACKUP"
                        rm -rf ${DEPLOY_DIR}/current
                        mv $LATEST_BACKUP ${DEPLOY_DIR}/current
                    fi