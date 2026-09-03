import { useMemo, useState } from 'react';
import {
  KeyboardAvoidingView,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';
import type { FormBlock, FormField } from '../../api/types';
import { isIos } from '../../core/platform';
import { useTheme } from '../../ui/theme';
import { ThemedText } from '../../ui/components/Text';

export interface FormSubmissionData {
  field: string;
  value: string | boolean;
}

export type SubmitHandler = (
  form: string | undefined,
  data: FormSubmissionData[],
) => Promise<{ ok: boolean; message?: string }>;

const MOCK_SUBMIT: SubmitHandler = async () => ({ ok: true });

interface FormBlockProps {
  block: FormBlock;
  onSubmit?: SubmitHandler;
}

function fieldType(type: string | undefined = 'text'): string {
  return type.toLowerCase();
}

export function FormBlockComponent({
  block,
  onSubmit = MOCK_SUBMIT,
}: FormBlockProps): JSX.Element | null {
  const theme = useTheme();
  const fields = (block.fields ?? []) as FormField[];
  const [values, setValues] = useState<Record<string, string | boolean>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<{ ok: boolean; message?: string } | null>(
    null,
  );

  const inputStyle = useMemo(
    () => [
      styles.input,
      {
        backgroundColor: theme.colors.surface,
        borderColor: theme.colors.border,
        color: theme.colors.text,
        minHeight: theme.touchTarget,
      },
    ],
    [theme],
  );

  if (!fields.length && !block.title) {
    return null;
  }

  if (result?.ok) {
    const successMessage = `${block.submitLabel ?? 'Enviado'} — ¡Gracias!`;
    return (
      <View testID="formBlock-success">
        <ThemedText variant="title" style={{ color: theme.colors.success }}>
          {successMessage}
        </ThemedText>
      </View>
    );
  }

  const setValue = (name: string, value: string | boolean) => {
    setValues(prev => ({ ...prev, [name]: value }));
    setErrors(prev => {
      if (!prev[name]) {
        return prev;
      }
      const next = { ...prev };
      delete next[name];
      return next;
    });
  };

  const validate = (): boolean => {
    const nextErrors: Record<string, string> = {};
    for (const field of fields) {
      const name = field.name ?? field.id ?? field.label;
      if (!name) {
        continue;
      }
      if (field.required) {
        const value = values[name];
        if (
          value === undefined ||
          value === '' ||
          (typeof value === 'boolean' && !value)
        ) {
          nextErrors[name] = 'Este campo es obligatorio';
        }
      }
    }
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) {
      return;
    }
    const data = fields
      .map(field => {
        const name = field.name ?? field.id ?? field.label;
        if (!name) {
          return null;
        }
        const value = values[name];
        if (value === undefined) {
          return null;
        }
        return { field: name, value };
      })
      .filter((entry): entry is FormSubmissionData => !!entry);

    setSubmitting(true);
    setResult(null);
    try {
      const outcome = await onSubmit(block.form, data);
      setResult(outcome);
    } finally {
      setSubmitting(false);
    }
  };

  const renderField = (field: FormField) => {
    const name = field.name ?? field.id ?? field.label;
    const label = field.label ?? name;
    const type = fieldType(field.type);
    const error = name ? errors[name] : undefined;

    if (!name) {
      return null;
    }

    if (type === 'select' || type === 'checkbox' || type === 'radio') {
      const options = field.options ?? [];
      const isCheckbox = type === 'checkbox';

      return (
        <View key={name} style={styles.fieldGroup}>
          <ThemedText variant="caption" color={isCheckbox ? 'text' : 'muted'}>
            {label}
            {field.required ? ' *' : ''}
          </ThemedText>
          {isCheckbox ? (
            <Pressable
              accessibilityRole="checkbox"
              accessibilityState={{ checked: !!values[name] }}
              accessibilityLabel={label}
              onPress={() => setValue(name, !values[name])}
              style={[
                styles.checkbox,
                { borderColor: theme.colors.border },
              ]}>
              <ThemedText
                variant="body"
                color={values[name] ? 'accent' : 'muted'}>
                {values[name] ? '✓' : ''}
              </ThemedText>
            </Pressable>
          ) : (
            options.map(option => {
              const optionValue = option.value ?? option.label ?? '';
              const selected = values[name] === optionValue;
              return (
                <Pressable
                  key={optionValue}
                  accessibilityRole={type === 'select' ? 'button' : 'radio'}
                  accessibilityState={{ selected }}
                  accessibilityLabel={option.label ?? optionValue}
                  onPress={() => setValue(name, optionValue)}
                  style={[
                    styles.option,
                    selected && {
                      backgroundColor: theme.colors.accent,
                    },
                  ]}>
                  <ThemedText
                    variant="body"
                    color={selected ? 'onAccent' : 'text'}>
                    {option.label ?? optionValue}
                  </ThemedText>
                </Pressable>
              );
            })
          )}
          {error ? (
            <ThemedText variant="caption" style={{ color: theme.colors.danger }}>
              {error}
            </ThemedText>
          ) : null}
        </View>
      );
    }

    const multiline = type === 'textarea';

    return (
      <View key={name} style={styles.fieldGroup}>
        <ThemedText variant="caption" color="muted">
          {label}
          {field.required ? ' *' : ''}
        </ThemedText>
        <TextInput
          accessibilityLabel={label}
          value={
            typeof values[name] === 'boolean'
              ? ''
              : (values[name] as string) ?? ''
          }
          onChangeText={text => setValue(name, text)}
          placeholder={field.placeholder}
          placeholderTextColor={theme.colors.textMuted}
          multiline={multiline}
          numberOfLines={multiline ? 4 : 1}
          keyboardType={
            type === 'email'
              ? 'email-address'
              : type === 'number'
              ? 'numeric'
              : type === 'tel' || type === 'phone'
              ? 'phone-pad'
              : 'default'
          }
          autoCapitalize={type === 'email' ? 'none' : 'sentences'}
          textContentType={
            type === 'email'
              ? 'emailAddress'
              : type === 'tel' || type === 'phone'
              ? 'telephoneNumber'
              : 'none'
          }
          style={[
            inputStyle,
            multiline && styles.textarea,
            error && { borderColor: theme.colors.danger },
          ]}
        />
        {error ? (
          <ThemedText variant="caption" style={{ color: theme.colors.danger }}>
            {error}
          </ThemedText>
        ) : null}
      </View>
    );
  };

  return (
    <KeyboardAvoidingView
      behavior={isIos ? 'padding' : undefined}
      keyboardVerticalOffset={isIos ? 64 : 0}>
      <ScrollView
        testID="formBlock"
        keyboardShouldPersistTaps="handled"
        style={[
          styles.container,
          { backgroundColor: theme.colors.surfaceAlt },
        ]}>
        {block.title ? (
          <ThemedText variant="title">{block.title}</ThemedText>
        ) : null}
        {block.description ? (
          <ThemedText variant="body" color="muted">
            {block.description}
          </ThemedText>
        ) : null}
        {fields.map(renderField)}
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={block.submitLabel}
          accessibilityState={{ disabled: submitting }}
          disabled={submitting}
          onPress={handleSubmit}
          style={({ pressed }) => [
            styles.submit,
            { backgroundColor: theme.colors.accent, minHeight: theme.touchTarget },
            pressed && styles.pressed,
          ]}>
          <ThemedText variant="button" color="onAccent">
            {submitting ? 'Enviando…' : block.submitLabel}
          </ThemedText>
        </Pressable>
        {result && !result.ok ? (
          <ThemedText variant="body" style={{ color: theme.colors.danger }}>
            {result.message ?? 'No se pudo enviar el formulario.'}
          </ThemedText>
        ) : null}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 14,
    padding: 20,
    marginBottom: 20,
    gap: 12,
    maxHeight: 420,
  },
  fieldGroup: {
    gap: 6,
  },
  input: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
  },
  textarea: {
    minHeight: 96,
    textAlignVertical: 'top',
  },
  checkbox: {
    width: 32,
    height: 32,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  option: {
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 10,
    minHeight: 44,
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  submit: {
    borderRadius: 999,
    paddingHorizontal: 20,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  pressed: {
    opacity: 0.8,
  },
});
