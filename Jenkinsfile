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
            sh 'rm -rf coverage/'
            sh 'npm run test'
            cobertura autoUpdateHealth: false, autoUpdateStability: false, coberturaReportFile: 'coverage/cobertura.xml', conditionalCoverageTargets: '70, 0, 0', failUnhealthy: false, failUnstable: false, lineCoverageTargets: '80, 0, 0', maxNumberOfBuilds: 0, methodCoverageTargets: '80, 0, 0', onlyStable: false
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
