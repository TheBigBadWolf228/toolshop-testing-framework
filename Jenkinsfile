// Local Jenkins version of .github/workflows/playwright.yml. Setup: jenkins/
def PLAYWRIGHT_IMAGE = 'mcr.microsoft.com/playwright:v1.64.1-noble'

void withTestUsers(Closure body) {
  withCredentials([
    usernamePassword(credentialsId: 'toolshop-customer', usernameVariable: 'CUSTOMER_EMAIL', passwordVariable: 'CUSTOMER_PASSWORD'),
    usernamePassword(credentialsId: 'toolshop-admin', usernameVariable: 'ADMIN_EMAIL', passwordVariable: 'ADMIN_PASSWORD')
  ]) {
    body()
  }
}

pipeline {
  agent any

  options {
    timeout(time: 45, unit: 'MINUTES')
    disableConcurrentBuilds()
    buildDiscarder(logRotator(numToKeepStr: '10'))
  }

  environment {
    CI = 'true'
    UI_URL = 'http://localhost:4200'
    API_URL = 'http://localhost:8091'
    APP = 'docker compose -f docker/app.compose.yml'
    PLAYWRIGHT_HTML_OPEN = 'never'
  }

  stages {
    stage('Gate') {
      agent {
        docker {
          image PLAYWRIGHT_IMAGE
          args '--network host'
          reuseNode true
        }
      }
      steps {
        sh 'rm -rf results reports'
        sh 'npm ci'
        sh 'npm run format:check'
        sh 'npm run typecheck'
        sh 'npx playwright test --list --reporter=list'
      }
    }

    stage('Start app') {
      steps {
        sh '$APP up -d --quiet-pull'
        sh '''
          for i in $(seq 1 30); do
            $APP exec -T mariadb mysqladmin ping -h 127.0.0.1 -uroot -proot --silent && exit 0
            sleep 2
          done
          exit 1
        '''
        sh '$APP exec -T laravel-api php artisan migrate:fresh --seed --force'
        sh '''
          curl -fsS -o /dev/null --retry 30 --retry-delay 2 --retry-all-errors $API_URL/status
          curl -fsS -o /dev/null --retry 60 --retry-delay 5 --retry-all-errors $UI_URL
        '''
      }
      post {
        failure {
          sh '$APP logs'
        }
      }
    }

    stage('Smoke') {
      agent {
        docker {
          image PLAYWRIGHT_IMAGE
          args '--network host'
          reuseNode true
        }
      }
      steps {
        withTestUsers {
          sh 'npx playwright test --project="API" --project="UI Chrome" --grep "@smoke" --reporter=list'
        }
      }
    }

    stage('Tests') {
      parallel {
        stage('API') {
          agent {
            docker {
              image PLAYWRIGHT_IMAGE
              args '--network host'
              reuseNode true
            }
          }
          environment {
            PLAYWRIGHT_JUNIT_OUTPUT_FILE = 'results/api.xml'
            PLAYWRIGHT_HTML_OUTPUT_DIR = 'reports/api'
          }
          steps {
            withTestUsers {
              sh 'npx playwright test --project="API" --workers=2 --output=test-results/api --reporter=list,junit,html'
            }
          }
          post {
            always {
              junit testResults: 'results/api.xml', allowEmptyResults: true
            }
          }
        }

        stage('UI Chrome') {
          agent {
            docker {
              image PLAYWRIGHT_IMAGE
              args '--network host'
              reuseNode true
            }
          }
          environment {
            PLAYWRIGHT_JUNIT_OUTPUT_FILE = 'results/ui-chrome.xml'
            PLAYWRIGHT_HTML_OUTPUT_DIR = 'reports/ui-chrome'
          }
          steps {
            withTestUsers {
              sh 'npx playwright test --project="UI Chrome" --output=test-results/ui-chrome --reporter=list,junit,html'
            }
          }
          post {
            always {
              junit testResults: 'results/ui-chrome.xml', allowEmptyResults: true
            }
          }
        }
      }
    }
  }

  post {
    always {
      archiveArtifacts artifacts: 'reports/**', allowEmptyArchive: true
      sh '$APP down -v'
    }
  }
}
