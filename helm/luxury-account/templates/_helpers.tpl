{{/*
Expand the name of the chart.
*/}}
{{- define "luxury-account.name" -}}
{{- default .Chart.Name .Values.nameOverride | trunc 63 | trimSuffix "-" }}
{{- end }}

{{/*
Create a default fully qualified app name.
We truncate at 63 chars because some Kubernetes name fields are limited to this (by the DNS naming spec).
If release name contains chart name it will be used as a full name.
*/}}
{{- define "luxury-account.fullname" -}}
{{- if .Values.fullnameOverride }}
{{- .Values.fullnameOverride | trunc 63 | trimSuffix "-" }}
{{- else }}
{{- $name := default .Chart.Name .Values.nameOverride }}
{{- if contains $name .Release.Name }}
{{- .Release.Name | trunc 63 | trimSuffix "-" }}
{{- else }}
{{- printf "%s-%s" .Release.Name $name | trunc 63 | trimSuffix "-" }}
{{- end }}
{{- end }}
{{- end }}

{{/*
Create chart name and version as used by the chart label.
*/}}
{{- define "luxury-account.chart" -}}
{{- printf "%s-%s" .Chart.Name .Chart.Version | replace "+" "_" | trunc 63 | trimSuffix "-" }}
{{- end }}

{{/*
Common labels
*/}}
{{- define "luxury-account.labels" -}}
helm.sh/chart: {{ include "luxury-account.chart" . }}
{{ include "luxury-account.selectorLabels" . }}
{{- if .Chart.AppVersion }}
app.kubernetes.io/version: {{ .Chart.AppVersion | quote }}
{{- end }}
app.kubernetes.io/managed-by: {{ .Release.Service }}
app.kubernetes.io/part-of: luxury-account
{{- end }}

{{/*
Selector labels
*/}}
{{- define "luxury-account.selectorLabels" -}}
app.kubernetes.io/name: {{ include "luxury-account.name" . }}
app.kubernetes.io/instance: {{ .Release.Name }}
{{- end }}

{{/*
Create the name of the service account to use
*/}}
{{- define "luxury-account.serviceAccountName" -}}
{{- if .Values.serviceAccount.create }}
{{- default (include "luxury-account.fullname" .) .Values.serviceAccount.name }}
{{- else }}
{{- default "default" .Values.serviceAccount.name }}
{{- end }}
{{- end }}

{{/*
Frontend labels
*/}}
{{- define "luxury-account.frontend.labels" -}}
{{ include "luxury-account.labels" . }}
app.kubernetes.io/component: frontend
{{- end }}

{{/*
Frontend selector labels
*/}}
{{- define "luxury-account.frontend.selectorLabels" -}}
{{ include "luxury-account.selectorLabels" . }}
app.kubernetes.io/component: frontend
{{- end }}

{{/*
API labels
*/}}
{{- define "luxury-account.api.labels" -}}
{{ include "luxury-account.labels" . }}
app.kubernetes.io/component: api
{{- end }}

{{/*
API selector labels
*/}}
{{- define "luxury-account.api.selectorLabels" -}}
{{ include "luxury-account.selectorLabels" . }}
app.kubernetes.io/component: api
{{- end }}

{{/*
Worker labels
*/}}
{{- define "luxury-account.worker.labels" -}}
{{ include "luxury-account.labels" . }}
app.kubernetes.io/component: worker
{{- end }}

{{/*
Worker selector labels
*/}}
{{- define "luxury-account.worker.selectorLabels" -}}
{{ include "luxury-account.selectorLabels" . }}
app.kubernetes.io/component: worker
{{- end }}

{{/*
Create a default image pull policy
*/}}
{{- define "luxury-account.imagePullPolicy" -}}
{{- default .Values.global.imagePullPolicy .Values.image.pullPolicy }}
{{- end }}

{{/*
Create the image tag to use
*/}}
{{- define "luxury-account.imageTag" -}}
{{- default .Chart.AppVersion .Values.image.tag }}
{{- end }}

{{/*
Common environment variables for all services
*/}}
{{- define "luxury-account.commonEnv" -}}
- name: ENVIRONMENT
  value: {{ .Values.global.environment | quote }}
- name: RELEASE_NAME
  value: {{ .Release.Name | quote }}
- name: NAMESPACE
  valueFrom:
    fieldRef:
      fieldPath: metadata.namespace
- name: POD_NAME
  valueFrom:
    fieldRef:
      fieldPath: metadata.name
- name: POD_IP
  valueFrom:
    fieldRef:
      fieldPath: status.podIP
{{- end }}

{{/*
ClickHouse connection string
*/}}
{{- define "luxury-account.clickhouseUrl" -}}
{{- if .Values.clickhouse.enabled }}
{{- printf "http://%s-clickhouse:%d" (include "luxury-account.fullname" .) (.Values.clickhouse.service.ports.http | int) }}
{{- else }}
{{- .Values.externalClickhouse.url }}
{{- end }}
{{- end }}

{{/*
RabbitMQ connection string
*/}}
{{- define "luxury-account.rabbitmqUrl" -}}
{{- if .Values.rabbitmq.enabled }}
{{- printf "amqp://%s:%s@%s-rabbitmq:%d" .Values.rabbitmq.auth.username "$(RABBITMQ_PASSWORD)" (include "luxury-account.fullname" .) (.Values.rabbitmq.service.ports.amqp | int) }}
{{- else }}
{{- .Values.externalRabbitmq.url }}
{{- end }}
{{- end }}

{{/*
MinIO endpoint
*/}}
{{- define "luxury-account.minioEndpoint" -}}
{{- if .Values.minio.enabled }}
{{- printf "%s-minio:%d" (include "luxury-account.fullname" .) (.Values.minio.service.ports.api | int) }}
{{- else }}
{{- .Values.externalMinio.endpoint }}
{{- end }}
{{- end }}

{{/*
Resource limits helper
*/}}
{{- define "luxury-account.resources" -}}
{{- if . }}
resources:
  {{- if .limits }}
  limits:
    {{- if .limits.cpu }}
    cpu: {{ .limits.cpu }}
    {{- end }}
    {{- if .limits.memory }}
    memory: {{ .limits.memory }}
    {{- end }}
  {{- end }}
  {{- if .requests }}
  requests:
    {{- if .requests.cpu }}
    cpu: {{ .requests.cpu }}
    {{- end }}
    {{- if .requests.memory }}
    memory: {{ .requests.memory }}
    {{- end }}
  {{- end }}
{{- end }}
{{- end }}

{{/*
Pod disruption budget selector
*/}}
{{- define "luxury-account.pdbSelector" -}}
matchLabels:
  {{ include "luxury-account.selectorLabels" . }}
  app.kubernetes.io/component: {{ .component }}
{{- end }}

{{/*
Network policy selector
*/}}
{{- define "luxury-account.networkPolicySelector" -}}
matchLabels:
  {{ include "luxury-account.selectorLabels" . }}
{{- end }}

{{/*
Monitoring labels
*/}}
{{- define "luxury-account.monitoringLabels" -}}
{{ include "luxury-account.labels" . }}
{{- if .Values.monitoring.enabled }}
monitoring: "true"
{{- end }}
{{- end }}

{{/*
Security context helper
*/}}
{{- define "luxury-account.securityContext" -}}
{{- if .Values.securityContext }}
securityContext:
  {{- toYaml .Values.securityContext | nindent 2 }}
{{- end }}
{{- end }}

{{/*
Pod security context helper
*/}}
{{- define "luxury-account.podSecurityContext" -}}
{{- if .Values.podSecurityContext }}
securityContext:
  {{- toYaml .Values.podSecurityContext | nindent 2 }}
{{- end }}
{{- end }} 