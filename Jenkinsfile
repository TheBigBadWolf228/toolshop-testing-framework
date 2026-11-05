// Local Jenkins version of .github/workflows/playwright.yml. Setup: jenkins/
pipeline {
  agent any

  options {
    timeout(time: 45, unit: 'MINUTES')
    disableConcurrentBuilds()
    buildDiscarder(logRotator(numToKeepStr: '10'))
  }

  environment {
    CI = 'true'
  }

  stages {
    stage('Gate') {
      agent {
        docker {
          image 'mcr.microsoft.com/playwright:v1.64.1-noble'
          args '--network host'
          reuseNode true
        }
      }
      steps {
        sh 'npm ci'
        sh 'npm run format:check'
        sh 'npm run typecheck'
        sh 'npx playwright test --list --reporter=list'
      }
    }
  }
}
