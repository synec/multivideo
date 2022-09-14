pipeline {
  agent any
  environment {
    APP_NAME = 'multivideo'
    SCARF_ANALYTICS = 'false'
  }
  tools {
    nodejs 'nodejs 16.x'
  }
  options {
    disableConcurrentBuilds()
    buildDiscarder(logRotator(numToKeepStr:'5', daysToKeepStr: '5'))
    timeout(time: 10, unit: 'MINUTES')
  }
  stages {
    stage("npm") {
      when {
        changeset "package-lock.json"
      }
      steps {
        sh 'npm ci --silent'
      }
    }

    stage("tests") {
      parallel {
        stage("lint") {
          steps {
            sh 'npm run lint'
          }
        }

        stage("test") {
          steps {
            sh 'npm run test'
          }
        }
      }
    }

    stage('sonarqube') {
      environment {
        scannerHome = tool 'sonarscanner'
      }
      steps {
        withSonarQubeEnv('sonarqube.sonarqube.svc.dv.cluster.local') {
          sh "${scannerHome}/bin/sonar-scanner"
        }
      }
    }

    stage("quality gate") {
      steps {
        timeout(time: 10, unit: 'MINUTES') {
          waitForQualityGate abortPipeline: true
        }
      }
    }

  }
}
